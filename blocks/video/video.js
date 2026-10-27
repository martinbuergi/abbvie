/**
 * video — the Brightcove video band (source brightcove-video): an authored poster under a navy
 * scrim with the title, the description and a "Watch" control; activating it loads the
 * Brightcove player in place and plays. Decode tier: template-slotted.
 * Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json (section 2).
 *
 * Authoring rows (classified by content):
 *   - <picture> poster image (editorial)
 *   - text paragraphs in order: title, description (optional), play label (last, e.g. "Watch 0:30")
 *   - Brightcove player URL(s), each alone in its paragraph —
 *     https://players.brightcove.net/<account>/<player>_default/index.html?videoId=<id>
 *     the first is the band's player; a second is the fallback player used when the first
 *     cannot load (the source's band player is domain-restricted by Brightcove)
 *
 * @ew-exempt <p> Brightcove player URLs — config, read for their ids and never displayed
 */

const PLAYER_URL = /players\.brightcove\.net\/(\d+)\/([\w-]+?)_default\/index\.html\?videoId=(\d+)/;

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

function play(stage, players) {
  const [first, fallback] = players;
  const v = el('video-js', 'video-player', {
    'data-account': first.account,
    'data-player': first.player,
    'data-embed': 'default',
    'data-video-id': first.videoId,
    controls: '',
    autoplay: '',
  });
  stage.append(v);
  stage.classList.add('is-playing');
  const start = () => {
    const p = window.videojs && window.videojs.getPlayer(v);
    if (!p) return;
    p.ready(() => {
      const go = p.play();
      if (go && go.catch) go.catch(() => {});
    });
  };
  loadPlayerScript(first.account, first.player).then((ok) => {
    if (ok || !fallback) {
      start();
      return;
    }
    v.setAttribute('data-player', fallback.player);
    loadPlayerScript(fallback.account, fallback.player).then(() => {
      if (window.bc && window.videojs && !window.videojs.getPlayer(v)) window.bc(v);
      start();
    });
  });
}

export default async function decorate(block) {
  const media = block.querySelector('picture, img');
  const links = [...block.querySelectorAll('a[href]')].filter((a) => PLAYER_URL.test(a.href));
  const players = links.map((a) => {
    const [, account, player, videoId] = a.href.match(PLAYER_URL);
    return { account, player, videoId };
  });
  const texts = [...block.querySelectorAll('p, h2, h3')].filter(
    (p) => !p.querySelector('picture, img, a') && p.textContent.trim(),
  );
  const titleEl = texts.length ? texts[0] : null;
  const playEl = texts.length > 1 ? texts[texts.length - 1] : null;
  const descEls = texts.slice(1, texts.length > 1 ? -1 : undefined);

  const stage = el('div', 'video-stage');
  const overlay = el('div', 'video-overlay');
  if (media) {
    const poster = el('div', 'video-poster');
    poster.append(media);
    overlay.append(poster);
  }
  const content = el('div', 'video-content');
  if (titleEl) {
    const title = el('div', 'video-title');
    title.append(titleEl);
    content.append(title);
  }
  if (descEls.length) {
    const desc = el('div', 'video-desc');
    desc.append(...descEls);
    content.append(desc);
  }
  const control = el('div', 'video-play', { role: 'button', tabindex: '0' });
  if (!playEl) control.setAttribute('aria-label', 'Play video');
  const icon = el('span', 'video-play-icon', { 'aria-hidden': 'true' });
  const label = el('div', 'video-play-text');
  if (playEl) label.append(playEl);
  control.append(icon, label);
  content.append(control);
  overlay.append(content);
  stage.append(overlay);
  block.replaceChildren(stage);

  if (!players.length) return;
  let started = false;
  const activate = () => {
    if (started) return;
    started = true;
    play(stage, players);
  };
  control.addEventListener('click', activate);
  control.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  });
}
