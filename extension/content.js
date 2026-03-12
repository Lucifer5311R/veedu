(() => {
  // ── Config ──────────────────────────────────────────────────────────────
  // Change this to your deployed Veedu URL
  const VEEDU_API =
    document.currentScript?.dataset?.api ||
    localStorage.getItem('veedu_api') ||
    'https://veedu-26.vercel.app';

  // ── Product data extraction ─────────────────────────────────────────────
  function extractProduct() {
    const url = location.href;

    // Title
    let title = '';
    const h1 = document.querySelector('h1');
    if (h1) title = h1.innerText.trim();
    if (!title) {
      const og = document.querySelector('meta[property="og:title"]');
      title = og?.content?.replace(/\s*[-|–]\s*meesho.*/i, '').trim() || '';
    }

    // Price — JSON-LD → ₹ in small leaf elements → body regex
    let price = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      if (price) return;
      try {
        const ld = JSON.parse(s.textContent || '');
        const p = ld?.offers?.price || ld?.price;
        if (p) price = parseInt(String(p), 10);
      } catch { /* skip */ }
    });
    if (!price) {
      for (const el of document.querySelectorAll('*')) {
        const txt = el.innerText || '';
        const m = txt.match(/₹\s*([0-9,]+)/);
        if (m && el.children.length === 0) {
          price = parseInt(m[1].replace(/,/g, ''), 10);
          break;
        }
      }
    }

    // Images from Meesho CDN
    const imgSet = new Set();
    document.querySelectorAll('img[src*="images.meesho.com/images/products"]').forEach(img => {
      if (!img.src.includes('profile')) {
        imgSet.add(img.src.replace(/_([\d]+)\.(jpg|jpeg|webp|png)(\?.*)?$/i, '_1024.$2$3'));
      }
    });
    // Also grab from srcset and background-image
    document.querySelectorAll('[srcset*="images.meesho.com"]').forEach(el => {
      const matches = el.getAttribute('srcset')?.match(/images\.meesho\.com\/images\/products\/[^"'\s,]+/g) || [];
      matches.forEach(m => imgSet.add(`https://${m}`.replace(/_([\d]+)\.(jpg|jpeg|webp|png)(\?.*)?$/i, '_1024.$2$3')));
    });

    // Description
    let description = '';
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) description = ogDesc.content?.trim() || '';

    return {
      url,
      title,
      price,
      images: [...imgSet].slice(0, 6),
      description,
    };
  }

  // ── Floating import button ──────────────────────────────────────────────
  function createButton() {
    if (document.getElementById('veedu-import-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'veedu-import-btn';
    btn.innerHTML = '🛒 Import to Veedu';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '999999',
      padding: '12px 24px',
      borderRadius: '50px',
      border: 'none',
      background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
      color: 'white',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    });

    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.05)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', handleImport);

    document.body.appendChild(btn);
  }

  // ── Toast notification ──────────────────────────────────────────────────
  function showToast(message, isError = false) {
    const existing = document.getElementById('veedu-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'veedu-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '80px',
      right: '24px',
      zIndex: '999999',
      padding: '12px 20px',
      borderRadius: '12px',
      background: isError ? '#E53E3E' : '#4CAF50',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'opacity 0.3s',
    });

    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
  }

  // ── Import handler ──────────────────────────────────────────────────────
  async function handleImport() {
    const btn = document.getElementById('veedu-import-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Importing…';
    btn.style.pointerEvents = 'none';

    try {
      const product = extractProduct();

      if (!product.title || !product.price) {
        showToast('Could not read product data. Try scrolling down first.', true);
        return;
      }

      const res = await fetch(`${VEEDU_API}/api/admin/scrape-meesho`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(product),
      });

      if (res.status === 401) {
        showToast('Not logged in. Open Veedu admin and log in first.', true);
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ "${product.title.slice(0, 40)}…" imported!`);
        btn.innerHTML = '✓ Imported!';
        btn.style.background = '#2E7D32';
        setTimeout(() => { btn.innerHTML = originalText; btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)'; }, 3000);
      } else {
        showToast(data.error || 'Import failed', true);
      }
    } catch (err) {
      showToast('Network error — is Veedu running?', true);
      console.error('[Veedu]', err);
    } finally {
      btn.style.pointerEvents = 'auto';
      if (btn.innerHTML === '⏳ Importing…') btn.innerHTML = originalText;
    }
  }

  // ── Init ────────────────────────────────────────────────────────────────
  // Wait for page to fully hydrate (Meesho is a Next.js SPA)
  function init() {
    const h1 = document.querySelector('h1');
    if (h1 && h1.innerText.trim().length > 3) {
      createButton();
    } else {
      setTimeout(init, 1000);
    }
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', () => setTimeout(init, 1500));
})();
