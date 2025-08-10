/*!
 * UATC page-data renderer (lenient)
 * - Accepts sections with `type` OR `name`
 * - Accepts content as `html` OR `content`
 * - Ignores empty/invalid items gracefully
 * - Only updates elements with IDs:
 *     #home-hero-title, #home-hero-subtitle, #home-hero-buttons, #home-sections
 *   (so your static "Principal Note" section in index.html remains untouched)
 */
(function (w, d) {
  function $(sel) { return d.querySelector(sel); }
  function create(tag, attrs) {
    const el = d.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(k => {
        if (k === 'text') el.textContent = attrs[k];
        else if (k === 'html') el.innerHTML = attrs[k];
        else el.setAttribute(k, attrs[k]);
      });
    }
    return el;
  }
  function safeSetHTML(el, html) { if (el && typeof html === 'string') el.innerHTML = html; }
  function safeSetText(el, txt) { if (el && typeof txt === 'string') el.textContent = txt; }
  function clear(el) { if (el) el.innerHTML = ''; }

  function loadJSON(url) {
    const bust = url.includes('?') ? '&' : '?';
    return fetch(url + bust + 'v=' + Date.now(), { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  // --- Render helpers ---
  function renderHero(hero) {
    if (!hero || typeof hero !== 'object') return;

    const titleEl = $('#home-hero-title');
    const subtitleEl = $('#home-hero-subtitle');
    const buttonsEl = $('#home-hero-buttons');

    safeSetText(titleEl, hero.title || '');
    safeSetText(subtitleEl, hero.subtitle || '');

    if (buttonsEl) {
      clear(buttonsEl);
      const buttons = Array.isArray(hero.buttons) ? hero.buttons : [];
      buttons.forEach(btn => {
        if (!btn || !btn.label || !btn.href) return;
        const a = create('a', {
          href: btn.href,
          class: 'btn btn-' + (btn.variant || 'primary'),
          text: btn.label
        });
        a.style.marginRight = '8px';
        buttonsEl.appendChild(a);
      });
    }
  }

  function normalizeType(item) {
    // Accept legacy `name` too
    return (item && (item.type || item.name)) ? (item.type || item.name) : 'richtext';
  }

  function normalizeHTML(item) {
    // Accept `html` or older `content`
    return (item && (item.html || item.content)) ? (item.html || item.content) : '';
  }

  function renderSections(sections) {
    const mount = $('#home-sections');
    if (!mount) {
      console.warn('[page-data] #home-sections not found; skipping dynamic sections.');
      return;
    }
    clear(mount);

    (Array.isArray(sections) ? sections : []).forEach((raw, idx) => {
      if (!raw || typeof raw !== 'object') return;

      const type = normalizeType(raw);
      const title = raw.title || '';
      const html = normalizeHTML(raw);

      // Render supported types
      if (type === 'richtext') {
        const wrap = create('div', { class: 'probootstrap-section' });
        const container = create('div', { class: 'container' });
        const row = create('div', { class: 'row' });
        const col = create('div', { class: 'col-md-12' });
        const block = create('div', { class: 'probootstrap-flex-block' });

        if (title) {
          const h3 = create('h3', { text: title });
          col.appendChild(h3);
        }

        const content = create('div', { class: 'probootstrap-text probootstrap-animate' });
        safeSetHTML(content, html);
        col.appendChild(content);

        block.appendChild(col);
        row.appendChild(block);
        container.appendChild(row);
        wrap.appendChild(container);
        mount.appendChild(wrap);
      } else if (type === 'list') {
        // items can be [{item:"..."}, "string", {title:"..."}] — handle flexibly
        const items = Array.isArray(raw.items) ? raw.items : [];
        const wrap = create('div', { class: 'probootstrap-section' });
        const container = create('div', { class: 'container' });
        const row = create('div', { class: 'row' });
        const col = create('div', { class: 'col-md-12' });

        if (title) col.appendChild(create('h3', { text: title }));

        const ul = create('ul', { class: 'list-unstyled' });
        items.forEach(it => {
          let text = '';
          if (typeof it === 'string') text = it;
          else if (it && typeof it === 'object') text = it.item || it.title || '';
          if (!text) return;
          const li = create('li', { html: '• ' + text });
          ul.appendChild(li);
        });

        col.appendChild(ul);
        row.appendChild(col);
        container.appendChild(row);
        wrap.appendChild(container);
        mount.appendChild(wrap);
      } else {
        // Unknown section types are ignored (but don’t break the page)
        console.warn('[page-data] Unsupported section type at index', idx, type);
      }
    });
  }

  function renderHome(json) {
    try {
      renderHero(json.hero);
      renderSections(json.sections);
    } catch (e) {
      console.error('[page-data] render error:', e);
    }
  }

  // Public API
  w.UATCPageData = {
    loadHome: function () {
      loadJSON('data/home.json')
        .then(renderHome)
        .catch(err => console.error('[page-data] Failed to load home.json:', err));
    }
  };
})(window, document);
