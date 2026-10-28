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
 *   - story-article variant of the same content (no option class — classified by content):
 *     instead of the <ul> trail, a back link (<p> holding only an <a>, e.g. "All Stories"), and
 *     meta <p>s before the headline: date, category, reading time ("9 Minute Read")
 *   Image-only heroes simply omit the player URL row. Without a player or story meta the hero
 *   gets the source's "height-default" layout (shorter image, short overlay card); option
 *   classes `height-tall` / `height-default` override that inference.
 *
 * The mobile breadcrumb toggle repeats the current page's name as a presentational copy
 * (EW4: no editor index; the authored <ul> stays the editable source).
 * @ew-exempt <p> Brightcove player URL — config, read for its ids and never displayed
 */

const PLAYER_URL = /players\.brightcove\.net\/(\d+)\/([\w-]+?)_default\/index\.html\?videoId=(\d+)/;
const DATE = /^[A-Za-z]+\.? \d{1,2}, \d{4}$/;
const READ_TIME = /\bmin(ute)?s?\b.*\bread\b/i;

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
  const outsideTrail = paragraphs.filter((p) => !(trail && trail.contains(p)));
  // with a headline, paragraphs before it are back link / meta and those after it the lede;
  // without one, the first paragraph is the lede (original behaviour)
  const order = heading ? [...block.querySelectorAll('h1, h2, h3, p')] : [];
  const follows = (p) => heading && order.indexOf(p) > order.indexOf(heading);
  const ledes = heading ? outsideTrail.filter(follows) : outsideTrail.slice(0, 1);
  const before = heading ? outsideTrail.filter((p) => !follows(p)) : [];
  const isLinkOnly = (p) => {
    const a = p.querySelector('a[href]');
    return a && p.querySelectorAll('a[href]').length === 1
      && a.textContent.trim() === p.textContent.trim();
  };
  const backP = before.find(isLinkOnly);
  const metaPs = before.filter((p) => p !== backP);

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
  if (backP) {
    const back = el('div', 'hero-back');
    back.append(backP);
    content.append(back);
  }
  if (metaPs.length) {
    const meta = el('div', 'hero-meta');
    const start = el('div', 'hero-meta-start');
    metaPs.forEach((p) => {
      const text = p.textContent.trim();
      if (READ_TIME.test(text)) {
        const time = el('div', 'hero-readtime');
        time.append(p);
        meta.append(time);
      } else {
        const field = el('div', DATE.test(text) ? 'hero-date' : 'hero-category');
        field.append(p);
        start.append(field);
      }
    });
    if (start.children.length) meta.prepend(start);
    content.append(meta);
  }
  if (heading) {
    const headline = el('div', 'hero-headline');
    headline.append(heading);
    content.append(headline);
  }
  if (ledes.length) {
    const ledeBox = el('div', 'hero-lede');
    ledeBox.append(...ledes);
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

  // layout options, as on the source hero-container: the ambient-video and story-article heroes
  // use the tall image (default CSS); a plain image hero uses the default image height with the
  // short overlay card. Authors can force either with a `height-tall` / `height-default` class.
  if (!ids) block.classList.add('is-image');
  if (backP || metaPs.length) block.classList.add('is-story');
  if (!block.classList.contains('height-tall') && !block.classList.contains('height-default')
    && !ids && !backP && !metaPs.length) {
    block.classList.add('height-default');
  }

  if (ids) {
    const ambient = el('div', 'hero-ambient');
    const toggle = el('button', 'hero-toggle', { type: 'button', 'aria-label': 'Pause/Play button' });
    mediaBox.append(ambient, toggle);
    const go = () => startAmbient(ambient, toggle, ids);
    if (document.readyState === 'complete') setTimeout(go, 0);
    else window.addEventListener('load', go, { once: true });
  }
}
