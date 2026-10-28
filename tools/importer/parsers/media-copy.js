/* eslint-disable */
/* global WebImporter */

/**
 * Parser: media-copy
 * Source (student-and-new-graduates s2):
 *   .inner-grid.cols-5-1-6.section-bottom-margin:not(.bg-f1f3ff):has(> .inner-grid-container > .inner-grid-col.span-5 .custom-image)
 *
 * Block rows (blocks/media-copy/media-copy.js): one row
 *   [ media cell: optional small heading + <picture> | copy cell: headings, <p>s,
 *     eyebrow <p> before a heading, <hr> divider, CTA <p><strong><a></a></strong></p> ]
 *
 * Variant: when the media column spans 5 of 12 columns (cols-5-1-6 grid /
 * .inner-grid-col.span-5 holding the image) the block gets the `wide-media`
 * option -> "Media Copy (wide-media)". A 4-1-6 source stays plain.
 */

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function validImg(img) {
  const src = img ? (img.getAttribute('src') || '').trim() : '';
  return !!src && src !== 'about:error';
}

function ctaParagraph(document, a) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const link = document.createElement('a');
  link.setAttribute('href', a.getAttribute('href') || '');
  link.textContent = text(a).replace(/,?\s*external link, opens in a new window$/i, '');
  strong.append(link);
  p.append(strong);
  return p;
}

/** Convert one source column (sequence of *-wrapper components) to authored elements. */
function convertColumn(col, document) {
  const out = [];
  [...col.children].forEach((wrap) => {
    const cls = wrap.className || '';

    if (/separator-wrapper/.test(cls)) {
      if (wrap.querySelector('.separator-divider')) out.push(document.createElement('hr'));
      return;
    }
    if (/eyebrow-text-wrapper/.test(cls)) {
      const t = text(wrap);
      if (t) {
        const p = document.createElement('p');
        p.textContent = t;
        out.push(p);
      }
      return;
    }
    if (/custom-title-wrapper/.test(cls)) {
      const h = wrap.querySelector('h1, h2, h3, h4, h5, h6');
      if (h && text(h)) {
        const nh = document.createElement(h.tagName.toLowerCase());
        nh.innerHTML = h.innerHTML;
        out.push(nh);
      }
      return;
    }
    if (/custom-image-wrapper/.test(cls)) {
      const pic = wrap.querySelector('picture') || wrap.querySelector('img');
      const img = pic && (pic.tagName === 'IMG' ? pic : pic.querySelector('img'));
      if (pic && validImg(img)) out.push(pic);
      return;
    }
    if (/text-container-wrapper/.test(cls)) {
      const root = wrap.querySelector('.text-container > div') || wrap.querySelector('.text-container') || wrap;
      [...root.children].forEach((c) => {
        if (text(c) || c.querySelector('img, picture')) out.push(c);
      });
      return;
    }
    if (/cta-wrapper/.test(cls)) {
      wrap.querySelectorAll('a[href]').forEach((a) => {
        if (text(a)) out.push(ctaParagraph(document, a));
      });
      return;
    }
    if (text(wrap) || wrap.querySelector('img, picture')) out.push(wrap);
  });
  // no leading/trailing dividers
  while (out.length && out[0].tagName === 'HR') out.shift();
  while (out.length && out[out.length - 1].tagName === 'HR') out.pop();
  return out;
}

export default function parse(element, { document }) {
  let cols = [...element.querySelectorAll(':scope > .inner-grid-container > .inner-grid-col')];
  if (!cols.length) cols = [...element.querySelectorAll('.inner-grid-col')];

  const mediaCol = cols.find((c) => c.querySelector('.custom-image picture, .custom-image img, picture'));
  const copyCols = cols.filter((c) => c !== mediaCol && text(c));

  const mediaCell = mediaCol ? convertColumn(mediaCol, document) : [];
  const copyCell = copyCols.flatMap((c) => convertColumn(c, document));

  const wide = element.classList.contains('cols-5-1-6')
    || !!(mediaCol && mediaCol.classList.contains('span-5'));

  const cells = [[mediaCell.length ? mediaCell : '', copyCell.length ? copyCell : '']];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'media-copy',
    variants: wide ? ['wide-media'] : [],
    cells,
  });
  element.replaceWith(block);
}
