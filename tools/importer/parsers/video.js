/* eslint-disable */
/* global WebImporter */

/**
 * Parser: video
 * Source (student-and-new-graduates Development Programs):
 *   .brightcove-video-wrapper > .brightcove-video.block
 *
 * Block rows (blocks/video/video.js — classified by content; matches the
 * authored pga-tour page):
 *   1. <picture> poster
 *   2. text <p>s: optional title, optional description, play label ("Watch 3:47")
 *   3. Brightcove player URL <p><a> — only when a real video id is present in
 *      the source DOM (data-video-id + data-account [+ data-player] on a
 *      video-js / [data-video-id] element):
 *      https://players.brightcove.net/<account>/<player>_default/index.html?videoId=<id>
 *      or, failing that, in the raw server markup of the source page (see rawVideoUrls).
 *      No id is invented; without one the row is omitted (poster only).
 */

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function validImg(img) {
  const src = img ? (img.getAttribute('src') || '').trim() : '';
  return !!src && src !== 'about:error';
}

function findVideoUrls(element) {
  const urls = [];
  const nodes = [element, ...element.querySelectorAll('[data-video-id], [data-videoid], video-js')];
  nodes.forEach((node) => {
    const videoId = node.getAttribute('data-video-id') || node.getAttribute('data-videoid');
    const account = node.getAttribute('data-account');
    const player = node.getAttribute('data-player') || 'default';
    if (!videoId || !account || !/^\d+$/.test(videoId) || !/^\d+$/.test(account)) return;
    const url = `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${videoId}`;
    if (!urls.includes(url)) urls.push(url);
  });
  return urls;
}

/*
 * The source is itself an EDS site: its brightcove-video block keeps account / player /
 * video id as plain cells in the raw server markup, but the decorated DOM drops them.
 * Fall back to the raw markup of the current page (same origin, synchronous), matching
 * the raw block by its poster media hash.
 */
function rawVideoUrls(posterSrc) {
  try {
    if (!window.__rawBrightcove) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', window.location.href.split('#')[0], false);
      xhr.send();
      const raw = new DOMParser().parseFromString(xhr.responseText || '', 'text/html');
      window.__rawBrightcove = [...raw.querySelectorAll('.brightcove-video')].map((blk) => {
        const vals = [...blk.querySelectorAll(':scope > div > div')].map((c) => c.textContent.trim());
        const ai = vals.findIndex((v) => /^\d{10,13}$/.test(v));
        const account = ai >= 0 ? vals[ai] : '';
        const player = vals.slice(ai + 1).find((v) => /^[A-Za-z0-9]{6,12}$/.test(v) && !/^\d+$/.test(v)) || 'default';
        const videoId = vals.slice(ai + 1).find((v) => /^\d{12,14}$/.test(v)) || '';
        const img = blk.querySelector('img');
        const hash = img ? ((img.getAttribute('src') || '').match(/media_[0-9a-f]+/) || [''])[0] : '';
        return { account, player, videoId, hash };
      });
    }
    const list = window.__rawBrightcove.filter((v) => v.account && v.videoId);
    const hash = ((posterSrc || '').match(/media_[0-9a-f]+/) || [''])[0];
    const hit = list.find((v) => hash && v.hash === hash) || (list.length === 1 ? list[0] : null);
    return hit ? [`https://players.brightcove.net/${hit.account}/${hit.player}_default/index.html?videoId=${hit.videoId}`] : [];
  } catch (e) {
    return [];
  }
}

function makeP(document, str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p;
}

export default function parse(element, { document }) {
  const cells = [];

  // 1. poster
  const pic = element.querySelector('.bcvideo-poster picture') || element.querySelector('picture');
  const img = pic ? pic.querySelector('img') : element.querySelector('.bcvideo-poster img, img');
  if (validImg(img)) {
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
    cells.push([pic || img]);
  }

  // 2. title / description / play label
  const texts = [];
  const title = text(element.querySelector('.bcvideo-title, .bcvideo-overlay-content h2, .bcvideo-overlay-content h3'));
  if (title) texts.push(makeP(document, title));
  const desc = text(element.querySelector('.bcvideo-description, .bcvideo-overlay-content p'));
  if (desc && desc !== title) texts.push(makeP(document, desc));
  const label = text(element.querySelector('.bcvideo-play-btn-text, .bcvideo-play-btn'));
  if (label) texts.push(makeP(document, label));
  if (texts.length) cells.push([texts]);

  // 3. Brightcove player URL(s) — only real ids from the DOM, else from the raw source markup
  let videoUrls = findVideoUrls(element);
  if (!videoUrls.length) videoUrls = rawVideoUrls(img ? img.getAttribute('src') : '');
  videoUrls.forEach((url) => {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.textContent = url;
    p.append(a);
    cells.push([p]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'video', cells });
  element.replaceWith(block);
}
