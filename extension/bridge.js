// Bridge content script — runs on the Veedu admin page
// Relays import requests from the admin page to the extension background
(() => {
  // Listen for import requests from the admin page
  window.addEventListener('veedu-import-request', async (event) => {
    const { url, requestId } = event.detail;

    try {
      // Ask background service worker to handle the import
      const response = await chrome.runtime.sendMessage({
        action: 'import-url',
        url,
      });

      window.dispatchEvent(new CustomEvent('veedu-import-response', {
        detail: { requestId, ...response },
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('veedu-import-response', {
        detail: { requestId, ok: false, error: err.message || 'Extension error' },
      }));
    }
  });

  // Signal to the admin page that the extension is installed
  document.documentElement.setAttribute('data-veedu-ext', 'true');
  window.dispatchEvent(new CustomEvent('veedu-ext-ready'));
})();
