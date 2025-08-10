/* js/page-data.js
   Renders home.json → index.html
   - Keeps richtext HTML exactly as authored in CMS (no extra wrapping that breaks layout)
   - Works alongside your existing ProBootstrap markup
*/

(function (w, d) {
  function $(sel) { return d.querySelector(sel); }
  function el(tag, cls) {
    const e = d.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }
  function loadJSON(url) {
    const bust = (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
    return fetch(url + bust, { cache: 'no-store' }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function renderHero(hero) {
    if (!hero) return;
    const t = $('#home-hero-title');
    const s = $('#home-hero-subtitle');
    const b = $('#home-hero-buttons');

    if (t) t.textContent = hero.title || '';
    if (s) s.textContent = hero.subtitle || '';

    if (b) {
      b.innerHTML = '';
      (hero.buttons || []).forEach(btn => {
        const a = el('a', 'btn btn-' + (btn.variant || 'primary'));
        a.textContent = btn.label || 'Learn more';
        a.href = btn.href || '#';
        a.style.marginRight = '8px';
        b.appendChild(a);
      });
    }
  }

  // Render a single section node from JSON
  function renderSection(sec) {
    const wrapper = el('div', 'home-section');

    // RICHTEXT: inject HTML exactly as provided
    if (sec.name === 'richtext') {
      if (sec.title) {
        const h = el('h3');
        h.textContent = sec.title;
        wrapper.appendChild(h);
      }
      const content = el('div');
      // IMPORTANT: keep author HTML intact
      content.innerHTML = sec.html || '';
      wrapper.appendChild(content);
      return wrapper;
    }

    // LIST: simple <ul>
    if (sec.name === 'list') {
      if (sec.title) {
        const h = el('h3');
        h.textContent = sec.title;
        wrapper.appendChild(h);
      }
      const ul = el('ul', 'list-unstyled');
      (sec.items || []).forEach(it => {
        const li = el('li');
        li.textContent = (typeof it === 'string' ? it : it.item) || '';
        ul.appendChild(li);
      });
      wrapper.appendChild(ul);
      return wrapper;
    }

    // Default/fallback
    const pre = el('pre');
    pre.textContent = JSON.stringify(sec, null, 2);
    wrapper.appendChild(pre);
    return wrapper;
  }

  function renderSections(sections) {
    const mount = $('#home-sections');
    if (!mount) return;

    // Clear and insert sections in order
    mount.innerHTML = '';
    (sections || []).forEach(sec => {
      // Keep your existing Principal Note layout if you prefer:
      // If you want the special two-column “Principal Note” block, detect by title:
      if (sec.name === 'richtext' && (sec.title || '').toLowerCase() === 'principal note') {
        // Build the same ProBootstrap layout you had in HTML
        const outer = el('section', 'probootstrap-section');
        const container = el('div', 'container');
        const row = el('div', 'row');
        const col = el('div', 'col-md-12');
        const flex = el('div', 'probootstrap-flex-block');
        const textCol = el('div', 'probootstrap-text probootstrap-animate');
        const imgCol = el('div', 'probootstrap-image probootstrap-animate');

        const h3 = el('h3');
        h3.textContent = sec.title || 'Principal Note';
        textCol.appendChild(h3);

        const content = el('div');
        content.innerHTML = sec.html || '';
        textCol.appendChild(content);

        // Keep your original background image + sizing
        imgCol.style.backgroundImage = "url('img/slider_5.png')";
        imgCol.style.height = '600px';
        imgCol.style.backgroundSize = 'cover';
        imgCol.style.backgroundPosition = 'center';

        flex.appendChild(textCol);
        flex.appendChild(imgCol);
        col.appendChild(flex);
        row.appendChild(col);
        container.appendChild(row);
        outer.appendChild(container);
        mount.appendChild(outer);
      } else {
        // Generic renderer
        const block = renderSection(sec);
        mount.appendChild(block);
      }
    });
  }

  function init() {
    // Only run on pages that declare the mounts
    const hasHome = $('#home-hero-title') || $('#home-sections');
    if (!hasHome) return;

    loadJSON('data/home.json')
      .then(data => {
        renderHero(data.hero);
        renderSections(data.sections);
      })
      .catch(err => {
        const mount = $('#home-sections');
        if (mount) {
          mount.innerHTML = '<p class="soft">Failed to load home content: ' + err.message + '</p>';
        }
        // Also log to console for local debugging
        console.error('[home.json] load error:', err);
      });
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
