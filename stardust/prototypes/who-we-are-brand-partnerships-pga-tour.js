/* Interaction parity — only behaviours observed on the live page (stardust/replica/motion/*.json):
   header dropdowns (Who We Are / MORE / GLOBAL / search), header show-nav/hide-nav scroll state,
   hero ambient player + pause toggle, video band play-in-place, back to top. */
(() => {
  const ACCOUNT = '2157889328001';
  const scripts = {};
  const loadPlayer = (player) => {
    if (!scripts[player]) {
      scripts[player] = new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = `https://players.brightcove.net/${ACCOUNT}/${player}_default/index.min.js`;
        s.onload = () => resolve(window.videojs);
        s.onerror = () => resolve(null);
        document.body.appendChild(s);
      });
    }
    return scripts[player];
  };

  // Header dropdowns: the top-level <li> carries aria-expanded (header.css drives the panel transition).
  const header = document.querySelector('.site-header');
  const items = [...document.querySelectorAll('.nav-section, .nav-tool')];
  const closeAll = (except) => items.forEach((li) => {
    if (li === except) return;
    li.setAttribute('aria-expanded', 'false');
    const b = li.querySelector(':scope > button'); if (b) b.setAttribute('aria-expanded', 'false');
  });
  items.forEach((li) => {
    const btn = li.querySelector(':scope > button');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = li.getAttribute('aria-expanded') !== 'true';
      closeAll(li);
      li.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-expanded', String(open));
      if (open && li.classList.contains('nav-tool--search')) {
        const input = li.querySelector('.nav-search__input'); if (input) setTimeout(() => input.focus(), 400);
      }
    });
    li.querySelectorAll('.nav-panel__close').forEach((c) => c.addEventListener('click', () => closeAll()));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.site-header')) closeAll(); });

  // Scroll state (observed: hide-nav while scrolling down, show-nav while scrolling up).
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > header.offsetHeight) { header.classList.add('hide-nav'); header.classList.remove('show-nav'); }
    else if (y < lastY) { header.classList.add('show-nav'); header.classList.remove('hide-nav'); }
    lastY = y;
  }, { passive: true });

  // Search field copy follows the viewport like the live header (desktop "Search", mobile "Search AbbVie.com").
  const searchInput = document.querySelector('.nav-search__input');
  const searchLabel = document.querySelector('.nav-search__label');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const syncSearch = () => {
    if (!searchInput || !searchLabel) return;
    const text = desktop.matches ? 'Search' : 'Search AbbVie.com';
    searchInput.setAttribute('aria-label', text);
    searchLabel.setAttribute('aria-label', 'Search');
    searchLabel.textContent = text;
  };
  syncSearch();
  desktop.addEventListener('change', syncSearch);

  // Hero: ambient Brightcove player (autoplay, muted, loop, controls disabled) + pause/play toggle.
  const heroEl = document.querySelector('.hero__player');
  const toggle = document.querySelector('.hero__toggle');
  if (heroEl) {
    loadPlayer(heroEl.dataset.player).then((videojs) => {
      const p = videojs && videojs.getPlayer(heroEl);
      if (!p) return;
      p.ready(() => {
        p.controls(false);
        p.muted(true);
        const go = p.play();
        if (go && go.catch) go.catch(() => {});
      });
      toggle.addEventListener('click', () => {
        if (p.paused()) { p.play(); toggle.setAttribute('aria-pressed', 'false'); }
        else { p.pause(); toggle.setAttribute('aria-pressed', 'true'); }
      });
    });
  }

  // Video band: static poster until "Watch" is pressed, then the band's player loads in place and autoplays.
  const band = document.querySelector('.video-band');
  if (band) {
    band.querySelector('.video-band__play-btn').addEventListener('click', () => {
      const { player, videoId } = band.dataset;
      const stage = band.querySelector('.video-band__stage');
      const v = document.createElement('video-js');
      v.className = 'video-band__player';
      v.setAttribute('data-account', ACCOUNT);
      v.setAttribute('data-player', player);
      v.setAttribute('data-embed', 'default');
      v.setAttribute('data-video-id', videoId);
      v.setAttribute('controls', '');
      v.setAttribute('autoplay', '');
      stage.appendChild(v);
      stage.classList.add('is-playing');
      // The band's own player (observed live: Lj7UrCc1z) is domain-restricted by Brightcove; off the
      // allowed origins fall back to the page's unrestricted player (pydM0AMeC) so the video still plays.
      const start = () => {
        const p = window.videojs && window.videojs.getPlayer(v);
        if (p) p.ready(() => { const go = p.play(); if (go && go.catch) go.catch(() => {}); });
      };
      loadPlayer(player).then((ok) => {
        if (ok) { start(); return; }
        const fallback = band.dataset.fallbackPlayer;
        v.setAttribute('data-player', fallback);
        loadPlayer(fallback).then(() => { if (window.bc) window.bc(v); start(); });
      });
    }, { once: true });
  }

  // Back to top.
  const top = document.querySelector('.back-to-top');
  if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
