/**
 * hero — the PGA TOUR page hero (source hero-container + breadcrumb): an authored poster with
 * the ambient Brightcove player over it, a pause/play toggle, and the white card holding the
 * breadcrumb trail, the page <h1> and the lede. Decode tier: template-slotted.
 * Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json (section 0).
 *
 * Authoring rows (classified by content — any row order, flattened cells tolerated):
 *   - <picture> poster image (editorial; empty alt when decorative)
 *   - Brightcove player URL, alone in its paragraph (optional) —
 *     https://players.brightcove.net/<account>/<player>_default/index.html?videoId=<id>
 *     → ambient player: autoplay, muted, loop, no controls; poster stays as the fallback
 *   - <ul> breadcrumb trail: linked ancestors, then the current page as a plain item
 *   - <h1> headline, then the lede <p>
 *
 * The mobile breadcrumb toggle repeats the current page's name as a presentational copy
 * (EW4: no editor index; the authored <ul> stays the editable source).
 * @ew-exempt <p> Brightcove player URL — config, read for its ids and never displayed
 */

const PLAYER_URL = /players\.brightcove\.net\/(\d+)\/([\w-]+?)_default\/index\.html\?videoId=(\d+)/;

// the control bar stays (hidden by CSS, as on the source); dialogs and overlays go
const UI_PARTS = [
  'BigPlayButton', 'TextTrackSettings', 'LoadingSpinner', 'ErrorDisplay', 'TextTrackDisplay',
  'TitleBar',
];
const UI_SELECTORS = '.vjs-big-play-button, .vjs-modal-dialog, .vjs-text-track-settings, '
  + '.vjs-loading-spinner, .vjs-error-display, .vjs-title-bar, .vjs-dock-text, '
  + '.vjs-text-track-display';

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function loadPlayerScript(account, player) {
  const src = `https://players.brightcove.net/${account}/${player}_default/index.min.js`;
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (existing.dataset.loaded) return Promise.resolve(window.videojs || null);
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(window.videojs || null));
      existing.addEventListener('error', () => resolve(null));
    });
  }
  return new Promise((resolve) => {
    const s = el('script', '', { src });
    s.addEventListener('load', () => {
      s.dataset.loaded = 'true';
      resolve(window.videojs || null);
    });
    s.addEventListener('error', () => resolve(null));
    document.head.append(s);
  });
}

function startAmbient(ambient, toggle, { account, player, videoId }) {
  const v = el('video-js', 'hero-player', {
    lang: 'none',
    'data-account': account,
    'data-player': player,
    'data-video-id': videoId,
    'data-embed': 'default',
    autoplay: '',
    muted: '',
    loop: '',
    playsinline: '',
  });
  ambient.append(v);
  loadPlayerScript(account, player).then((videojs) => {
    if (!videojs) return;
    if (window.bc && !videojs.getPlayer(v)) window.bc(v);
    const p = videojs.getPlayer(v);
    if (!p) return;
    p.ready(() => {
      p.controls(false);
      p.muted(true);
      // ambient player: no UI — drop the player's hidden dialogs and screen-reader text so
      // the block renders (almost) only authored words (#100)
      UI_PARTS.forEach((name) => {
        const part = p.getChild(name);
        if (part) {
          p.removeChild(part);
          part.dispose();
        }
      });
      v.querySelectorAll(UI_SELECTORS).forEach((n) => n.remove());
      const go = p.play();
      if (go && go.catch) go.catch(() => {});
    });
    toggle.addEventListener('click', () => {
      if (p.paused()) {
        p.play();
        toggle.setAttribute('aria-pressed', 'false');
      } else {
        p.pause();
        toggle.setAttribute('aria-pressed', 'true');
      }
    });
  });
}

export default async function decorate(block) {
  const media = block.querySelector('picture, img');
  const configLink = [...block.querySelectorAll('a[href]')].find((a) => PLAYER_URL.test(a.href));
  const trail = block.querySelector('ul, ol');
  const heading = block.querySelector('h1, h2, h3');
  const paragraphs = [...block.querySelectorAll('p')].filter(
    (p) => !p.querySelector('picture, img') && !(configLink && p.contains(configLink))
      && p.textContent.trim(),
  );
  const lede = paragraphs.find((p) => !(trail && trail.contains(p)));

  const mediaBox = el('div', 'hero-media');
  if (media) {
    const poster = el('div', 'hero-poster');
    poster.append(media);
    mediaBox.append(poster);
  }

  const content = el('div', 'hero-content');
  if (trail) {
    const crumb = el('div', 'breadcrumb');
    const nav = el('nav', 'breadcrumb-nav', { 'aria-label': 'Breadcrumb' });
    const items = trail.querySelectorAll('li');
    const current = items[items.length - 1];
    if (current) {
      current.setAttribute('aria-current', 'page');
      // mobile toggle: a presentational copy of the current page's name (EW4) — the authored
      // trail stays the one editable source; the toggle opens it below 744px like the source
      const label = current.textContent;
      const toggle = el('button', 'breadcrumb-toggle', {
        type: 'button',
        'aria-label': `${label}, Breadcrumb`,
        'aria-expanded': 'false',
      });
      toggle.append(document.createTextNode(label));
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        crumb.classList.toggle('is-open', open);
      });
      crumb.append(toggle);
    }
    nav.append(trail);
    crumb.append(nav);
    content.append(crumb);
  }
  if (heading) {
    const headline = el('div', 'hero-headline');
    headline.append(heading);
    content.append(headline);
  }
  if (lede) {
    const ledeBox = el('div', 'hero-lede');
    ledeBox.append(lede);
    content.append(ledeBox);
  }

  const inner = el('div', 'hero-inner');
  inner.append(content);
  const card = el('div', 'hero-card');
  card.append(inner);
  const outer = el('div', 'hero-outer');
  outer.append(card);

  let ids = null;
  if (configLink) {
    const [, account, player, videoId] = configLink.href.match(PLAYER_URL);
    ids = { account, player, videoId };
  }

  block.replaceChildren(mediaBox, outer);

  if (ids) {
    const ambient = el('div', 'hero-ambient');
    const toggle = el('button', 'hero-toggle', { type: 'button', 'aria-label': 'Pause/Play button' });
    mediaBox.append(ambient, toggle);
    const go = () => startAmbient(ambient, toggle, ids);
    if (document.readyState === 'complete') setTimeout(go, 0);
    else window.addEventListener('load', go, { once: true });
  }
}
