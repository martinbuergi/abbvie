/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero
 * Source: .hero-container-wrapper > .hero-container.block (all three templates)
 *
 * Block rows (blocks/hero/hero.js — classified by content; matches the
 * authored pga-tour page):
 *   1. <picture> poster (from .hero-container-bg, never the hidden
 *      .hero-container-item-authoring-data duplicate)
 *   2. Brightcove player URL paragraph — only when a real video id is present
 *      in the source DOM (data-video-id / video-js attributes). The number in
 *      the authoring data (2157889325001) is an account id, not a video id.
 *   3a. <ul> breadcrumb (from the source breadcrumb <ol>): linked ancestors
 *       as <a>, current page as plain text, OR
 *   3b. story variant: back link <p><a>All Stories</a></p> row, then a meta
 *       row of <p>s: date, category, reading time
 *   4. <h1> headline + lede <p>(s)
 */

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function validImg(img) {
  const src = img ? (img.getAttribute('src') || '').trim() : '';
  return !!src && src !== 'about:error';
}

function findVideoUrl(element) {
  const node = element.querySelector('[data-video-id], video-js[data-video-id], [data-videoid]');
  if (!node) return null;
  const videoId = node.getAttribute('data-video-id') || node.getAttribute('data-videoid');
  const account = node.getAttribute('data-account');
  const player = node.getAttribute('data-player') || 'default';
  if (!videoId || !account || !/^\d+$/.test(videoId)) return null;
  return `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${videoId}`;
}

export default function parse(element, { document }) {
  const cells = [];

  // the hidden authoring-data duplicate must never leak into the output
  const authoring = [...element.querySelectorAll('.hero-container-item-authoring-data')];

  // 1. poster
  const bgPic = element.querySelector('.hero-container-bg picture')
    || element.querySelector('.hero-container-bg img');
  const bgImg = bgPic && (bgPic.tagName === 'IMG' ? bgPic : bgPic.querySelector('img'));
  if (bgPic && validImg(bgImg)) {
    if (bgImg && !bgImg.hasAttribute('alt')) bgImg.setAttribute('alt', '');
    cells.push([bgPic]);
  }

  // 2. Brightcove URL (only with a real video id)
  const videoUrl = findVideoUrl(element);
  if (videoUrl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', videoUrl);
    a.textContent = videoUrl;
    p.append(a);
    cells.push([p]);
  }

  const content = element.querySelector('.hero-container-content-width')
    || element.querySelector('.hero-container-section-inner')
    || element;

  // 3a. breadcrumb trail
  const trail = content.querySelector('.breadcrumb ol, .breadcrumb ul, .breadcrumb-nav ol, nav ol');
  if (trail) {
    const ul = document.createElement('ul');
    [...trail.querySelectorAll(':scope > li')].forEach((li) => {
      const label = text(li.querySelector('span') || li) || text(li);
      if (!label) return;
      const item = document.createElement('li');
      const a = li.querySelector('a[href]');
      if (a) {
        const link = document.createElement('a');
        link.setAttribute('href', a.getAttribute('href'));
        link.textContent = text(a);
        item.append(link);
      } else {
        item.textContent = label;
      }
      ul.append(item);
    });
    if (ul.children.length) cells.push([ul]);
  }

  // 3b. story variant: back link + meta
  if (!trail) {
    const backA = content.querySelector('.cta-wrapper .back-cta a[href], .back-cta a[href]')
      || content.querySelector(':scope > .cta-wrapper a[href]');
    if (backA && text(backA)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', backA.getAttribute('href'));
      a.textContent = text(backA);
      p.append(a);
      cells.push([p]);
    }
    const meta = content.querySelector('.story-card-meta');
    if (meta) {
      const metaPs = [];
      const date = text(meta.querySelector('.story-card-date, time'));
      const category = text(meta.querySelector('.story-card-eyebrow, .card-eyebrow'));
      const readTime = text(meta.querySelector('.story-card-read-time'));
      [date, category, readTime].forEach((t) => {
        if (!t) return;
        const p = document.createElement('p');
        p.textContent = t;
        metaPs.push(p);
      });
      if (metaPs.length) cells.push([metaPs]);
    }
  }

  // 4. headline + lede
  const headCell = [];
  const h = content.querySelector('.custom-title h1, h1') || content.querySelector('.custom-title h2, h2');
  if (h) {
    const h1 = document.createElement('h1');
    h1.innerHTML = h.innerHTML;
    headCell.push(h1);
  }
  content.querySelectorAll('.text-container-wrapper').forEach((wrap) => {
    if (authoring.some((a) => a.contains(wrap))) return;
    const root = wrap.querySelector('.text-container > div') || wrap.querySelector('.text-container') || wrap;
    [...root.children].forEach((c) => {
      if (!text(c)) return;
      if (c.tagName === 'P') {
        headCell.push(c);
      } else {
        const p = document.createElement('p');
        p.innerHTML = c.innerHTML;
        headCell.push(p);
      }
    });
  });
  if (headCell.length) cells.push([headCell]);

  authoring.forEach((a) => a.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
