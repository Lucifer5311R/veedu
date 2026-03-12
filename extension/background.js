// Background service worker for Veedu Importer extension
// Handles URL import requests: opens Meesho tab → waits → triggers content script → returns result

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'import-url') {
    handleUrlImport(msg.url)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true; // keep channel open for async
  }
});

async function handleUrlImport(url) {
  // Validate URL
  if (!/^https?:\/\/(www\.)?meesho\.com\/.+\/p\/.+/i.test(url)) {
    return { ok: false, error: 'Not a valid Meesho product URL' };
  }

  // Check if API key is configured
  const storage = await chrome.storage.local.get(['veedu_key']);
  if (!storage.veedu_key) {
    return { ok: false, error: 'API key not set. Click the extension icon and enter your key.' };
  }

  // Open Meesho page in background tab
  const tab = await chrome.tabs.create({ url, active: false });

  try {
    // Wait for page to fully load
    await waitForTab(tab.id, 25000);

    // Extra wait for Next.js hydration
    await sleep(3000);

    // Send auto-import message to the content script on that tab
    const result = await sendToTab(tab.id, { action: 'auto-import' });

    return result || { ok: false, error: 'No response from content script' };
  } finally {
    // Always close the background tab
    try { chrome.tabs.remove(tab.id); } catch { /* tab may already be closed */ }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function sendToTab(tabId, msg) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, msg, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: 'Content script not ready. Page may still be loading.' });
      } else {
        resolve(response);
      }
    });
  });
}

function waitForTab(tabId, timeout = 25000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      if (Date.now() - start > timeout) {
        reject(new Error('Page took too long to load'));
        return;
      }
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error('Tab closed'));
          return;
        }
        if (tab.status === 'complete') {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      });
    }
    check();
  });
}
