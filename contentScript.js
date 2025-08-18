chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "START_AUTOMATION") {
    let { likeCount, commentCount, commentText } = request;
    let posts = document.querySelectorAll("div.feed-shared-update-v2");

    let likeIndex = 0;
    let commentIndex = 0;

    // Like automation
    function likeNext() {
      if (likeIndex < likeCount && likeIndex < posts.length) {
        let post = posts[likeIndex];
        let likeBtn = post.querySelector('button[aria-pressed]');
        if (likeBtn && likeBtn.getAttribute("aria-pressed") === "false") {
          likeBtn.click();
        }
        likeIndex++;
        setTimeout(likeNext, 1500);
      } else {
        commentNext();
      }
    }

    // Comment automation
    function commentNext() {
      if (commentIndex < commentCount && commentIndex < posts.length) {
        let post = posts[commentIndex];
        let commentBtn = post.querySelector('button.comment-button, button[data-control-name="comment"]');
        if (commentBtn) {
          commentBtn.click();
          setTimeout(() => {
            let textArea = post.querySelector('textarea.comments-comment-box__textarea');
            if (textArea) {
              textArea.focus();
              textArea.value = commentText;

              // Fire input event so React/LinkedIn detects the change
              textArea.dispatchEvent(new Event('input', { bubbles: true }));

              // Press Enter key to submit
              let enterEvent = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                code: 'Enter',
                keyCode: 13
              });
              textArea.dispatchEvent(enterEvent);
            }
          }, 1000);
        }
        commentIndex++;
        setTimeout(commentNext, 2000);
      }
    }

    likeNext();
    sendResponse({ success: true });
  }
});
