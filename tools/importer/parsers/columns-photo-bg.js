/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-photo-bg
 * Source (student-and-new-graduates "Stay in touch / Join us"):
 *   #section-bg-6 > .inner-grid-wrapper > .inner-grid.cols-4-8.first-col-bg-white
 * The background photograph is a direct child of the section
 * (#section-bg-6 > img), outside the mapped element, so it is read via the
 * enclosing section.
 *
 * Block rows (blocks/columns-photo-bg/columns-photo-bg.js):
 *   row 1: [ background picture ]                       (single cell)
 *   row 2: [ left card | right card ]
 *     left card:  eyebrow <p>, text <p>(s), CTA <p><strong><a></a></strong></p>
 *     right card: eyebrow <p>, <h2> title, <ul> of links
 */

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function makeP(document, str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p;
}

function ctaParagraph(document, a) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const link = document.createElement('a');
  link.setAttribute('href', a.getAttribute('href') || '');
  link.textContent = text(a.querySelector('.cta-text, span:not(.sr-only):not([class*="icon"])') || a)
    .replace(/,?\s*external link, opens in a new window$/i, '');
  strong.append(link);
  p.append(strong);
  return p;
}

/** Content of one source column (generic: eyebrow, title, text, CTAs, link lists). */
function buildCard(col, document) {
  const out = [];
  [...col.children].forEach((wrap) => {
    const cls = wrap.className || '';
    if (/separator-wrapper/.test(cls)) return;

    if (/eyebrow-text-wrapper/.test(cls)) {
      const t = text(wrap);
      if (t) out.push(makeP(document, t));
      return;
    }

    if (/custom-title-wrapper/.test(cls)) {
      const h = wrap.querySelector('h1, h2, h3, h4, h5, h6');
      if (h) {
        const nh = document.createElement('h2');
        nh.innerHTML = h.innerHTML;
        out.push(nh);
      }
      return;
    }

    if (/text-container-wrapper/.test(cls)) {
      const root = wrap.querySelector('.text-container > div') || wrap.querySelector('.text-container') || wrap;
      [...root.children].forEach((c) => { if (text(c) || c.querySelector('img, picture')) out.push(c); });
      return;
    }

    if (/cta-wrapper/.test(cls)) {
      wrap.querySelectorAll('a[href]').forEach((a) => out.push(ctaParagraph(document, a)));
      return;
    }

    if (/dashboard-card-link-list-wrapper/.test(cls)) {
      const eyebrow = text(wrap.querySelector('.dashboard-card-link-list-eyebrow'));
      if (eyebrow) out.push(makeP(document, eyebrow));
      const title = text(wrap.querySelector('.dashboard-card-link-list-title'));
      if (title) {
        const h2 = document.createElement('h2');
        h2.textContent = title;
        out.push(h2);
      }
      const links = [...wrap.querySelectorAll('.dashboard-card-link-list-links a[href], ul a[href]')];
      if (links.length) {
        const ul = document.createElement('ul');
        links.forEach((a) => {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.setAttribute('href', a.getAttribute('href'));
          link.textContent = text(a.querySelector('.dashboard-card-link-list-link-text') || a)
            .replace(/,?\s*external link, opens in a new window$/i, '');
          li.append(link);
          ul.append(li);
        });
        out.push(ul);
      }
      return;
    }

    // anything else with content is kept as-is
    if (text(wrap) || wrap.querySelector('img, picture')) out.push(wrap);
  });
  return out;
}

export default function parse(element, { document }) {
  const cells = [];

  // background photo from the enclosing section
  const section = element.closest('#section-bg-6') || element.closest('.section');
  let bgImg = null;
  if (section) {
    bgImg = section.querySelector(':scope > img, :scope > picture img');
  }
  if (bgImg) {
    const src = (bgImg.getAttribute('src') || '').trim();
    if (src && src !== 'about:error') {
      const img = document.createElement('img');
      img.setAttribute('src', src);
      img.setAttribute('alt', bgImg.getAttribute('alt') || '');
      cells.push([img]);
      // consumed: remove so it is not imported again
      (bgImg.closest('picture') || bgImg).remove();
    }
  } else if (section) {
    // Live render: the section photo is applied as an inline CSS
    // background-image on the section (no <img> child).
    const style = section.getAttribute('style') || '';
    const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (m && m[1]) {
      const img = document.createElement('img');
      img.setAttribute('src', m[1].trim());
      img.setAttribute('alt', '');
      cells.push([img]);
      // consumed: drop the background so transformBackgroundImages does not
      // import it a second time as loose section content
      section.style.removeProperty('background-image');
      if (!section.getAttribute('style')) section.removeAttribute('style');
    }
  }

  let cols = [...element.querySelectorAll(':scope > .inner-grid-container > .inner-grid-col')];
  if (!cols.length) cols = [...element.querySelectorAll('.inner-grid-col')];
  const cards = cols.map((col) => buildCard(col, document)).filter((c) => c.length);
  if (cards.length) cells.push(cards);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-photo-bg', cells });
  element.replaceWith(block);
}
