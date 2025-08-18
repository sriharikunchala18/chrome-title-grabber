document.addEventListener("DOMContentLoaded", () => {
  const likeInput = document.getElementById("likeCount");
  const commentInput = document.getElementById("commentCount");
  const commentText = document.getElementById("commentText");
  const startBtn = document.getElementById("startBtn");
  const statusEl = document.getElementById("status");

  // Enable ONLY when both fields are > 0
  function validate() {
    const l = parseInt(likeInput.value, 10);
    const c = parseInt(commentInput.value, 10);
    startBtn.disabled = !(l > 0 && c > 0);
  }
  likeInput.addEventListener("input", validate);
  commentInput.addEventListener("input", validate);

  startBtn.addEventListener("click", async () => {
    const likeCount = parseInt(likeInput.value, 10);
    const commentCount = parseInt(commentInput.value, 10);
    const text = (commentText.value || "CFBR").trim() || "CFBR";

    const FEED = "https://www.linkedin.com/feed/";

    // helper to inject and run
    async function runOnTab(tabId) {
      statusEl.textContent = "Injecting automation...";
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: automationScript,
          args: [likeCount, commentCount, text]
        });
        statusEl.textContent = "Running... (watch the feed)";
        // close popup after a short delay so user sees status
        setTimeout(() => window.close(), 600);
      } catch (e) {
        statusEl.textContent = "Injection failed: " + String(e);
      }
    }

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // If already on feed, run directly
    if (tab && tab.url && tab.url.startsWith(FEED)) {
      await runOnTab(tab.id);
      return;
    }

    // Otherwise open feed in a new tab (host_permissions lets us inject there)
    statusEl.textContent = "Opening LinkedIn feed...";
    const newTab = await chrome.tabs.create({ url: FEED, active: true });

    // Wait for the new tab to complete loading, then inject
    const onUpdated = async (tabId, info) => {
      if (tabId === newTab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        // small delay gives LinkedIn time to render editor/react handlers
        setTimeout(() => runOnTab(newTab.id), 800);
      }
    };
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
});

/**
 * Runs inside the LinkedIn page.
 * Randomly likes N posts and comments M posts with the given text (default CFBR).
 */
async function automationScript(likeCount, commentCount, commentText) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const log = (...a) => console.log("[AutoLC]", ...a);

  // Try to ensure enough posts are loaded
  for (let i = 0; i < 4; i++) {
    window.scrollBy({ top: 1400, behavior: "smooth" });
    await sleep(700);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  await sleep(600);

  // Collect post containers (broad selectors for LinkedIn feed)
  let posts = Array.from(document.querySelectorAll("div.feed-shared-update-v2, div.occludable-update, article"));
  posts = posts.filter(Boolean);
  if (!posts.length) {
    alert("No posts found on the feed.");
    return;
  }

  // Utility: Fisher–Yates shuffle
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const likeTargets = shuffle(posts).slice(0, likeCount);
  const commentTargets = shuffle(posts).slice(0, commentCount);

  // LIKE flow
  for (const post of likeTargets) {
    const likeBtn =
      post.querySelector('button[aria-pressed="false"][aria-label*="Like"]') ||
      post.querySelector('button[aria-label*="Like"]') ||
      post.querySelector('button[aria-label*="React"]') ||
      post.querySelector('button[aria-label*="Celebrate"], button[aria-label*="Support"], button[aria-label*="Love"]');

    if (likeBtn) {
      likeBtn.click();
      log("👍 Liked a post");
      await sleep(rand(700, 1400));
    }
  }

  // COMMENT flow
  for (const post of commentTargets) {
    const commentBtn = post.querySelector('button[aria-label*="Comment"]');
    if (!commentBtn) continue;

    commentBtn.click();
    await sleep(rand(900, 1500));

    // Prefer an editor within the same post first
    let editor =
      post.querySelector('div[role="textbox"][contenteditable="true"]') ||
      post.querySelector('div.comments-comment-box__editor[contenteditable="true"]');

    // Fallback: sometimes LinkedIn uses a shared editor outside the post node
    if (!editor) {
      editor = document.querySelector('div[role="textbox"][contenteditable="true"], div.comments-comment-box__editor[contenteditable="true"]');
    }
    if (!editor) {
      log("No editor found for a post, skipping.");
      continue;
    }

    // Focus and clear previous text
    editor.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("delete");

    // Insert our text in a way React detects
    document.execCommand("insertText", false, commentText);
    editor.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true }));
    editor.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(rand(500, 900));

    // Click the "Post" button (local first, then global)
    const postBtn =
      post.querySelector('button.comments-comment-box__submit-button') ||
      post.querySelector('button[aria-label="Post"]') ||
      document.querySelector('button.comments-comment-box__submit-button, button[aria-label="Post"]');

    if (postBtn) {
      postBtn.click();
      log("💬 Commented:", commentText);
    } else {
      // Last resort: press Enter
      editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
      log("💬 Commented via Enter fallback.");
    }
    await sleep(rand(1000, 1700));
  }

  alert("✅ Finished: liked " + likeCount + " and commented " + commentCount + " posts.");
}
