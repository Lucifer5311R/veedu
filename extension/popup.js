// Veedu Importer — Extension Popup
(() => {
  const keyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const savedBadge = document.getElementById('saved-badge');
  const urlInput = document.getElementById('meeshoUrl');
  const importBtn = document.getElementById('importBtn');
  const statusEl = document.getElementById('status');

  // Load saved key on open
  chrome.storage.local.get(['veedu_key'], (result) => {
    if (result.veedu_key) {
      keyInput.value = result.veedu_key;
      savedBadge.style.display = 'inline';
    }
  });

  // Save API key
  saveKeyBtn.addEventListener('click', () => {
    const key = keyInput.value.trim();
    chrome.storage.local.set({ veedu_key: key }, () => {
      savedBadge.style.display = 'inline';
      savedBadge.textContent = '✓ Saved';
      setTimeout(() => { savedBadge.style.display = 'none'; }, 2000);
    });
  });

  function setStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = 'status ' + type;
  }

  // Validate URL
  function isMeeshoUrl(url) {
    return /^https?:\/\/(www\.)?meesho\.com\/.+\/p\/.+/i.test(url);
  }

  // Import flow: open tab → wait for load → message content script → close tab
  importBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    if (!isMeeshoUrl(url)) {
      setStatus('Not a valid Meesho product URL', 'error');
      return;
    }

    // Check if API key is set
    const result = await new Promise(r => chrome.storage.local.get(['veedu_key'], r));
    if (!result.veedu_key) {
      setStatus('Set your API key first ↑', 'error');
      return;
    }

    // Inject key into the page's localStorage via content script
    importBtn.disabled = true;
    setStatus('⏳ Opening Meesho page…', 'loading');

    try {
      // Open tab in background
      const tab = await chrome.tabs.create({ url, active: false });

      // Wait for page to fully load + hydrate
      await waitForTabReady(tab.id, 20000);

      setStatus('⏳ Reading product data…', 'loading');

      // Wait for content script to initialize
      await sleep(3000);

      // Ask content script to auto-import
      const response = await sendMessageToTab(tab.id, { action: 'auto-import' });

      // Close the background tab
      chrome.tabs.remove(tab.id);

      if (response && response.ok) {
        setStatus(`✓ Imported: ${response.title?.slice(0, 50)}…`, 'success');
        urlInput.value = '';
      } else {
        setStatus(response?.error || 'Import failed — try opening the page manually', 'error');
      }
    } catch (err) {
      setStatus(err.message || 'Something went wrong', 'error');
      console.error('[Veedu popup]', err);
    } finally {
      importBtn.disabled = false;
    }
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function sendMessageToTab(tabId, msg) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, msg, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: 'Content script not ready. Try again.' });
        } else {
          resolve(response);
        }
      });
    });
  }

  function waitForTabReady(tabId, timeout = 20000) {
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
})();
