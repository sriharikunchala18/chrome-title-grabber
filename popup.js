document.addEventListener('DOMContentLoaded', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  document.getElementById('pageTitle').textContent = tab.title;
});
