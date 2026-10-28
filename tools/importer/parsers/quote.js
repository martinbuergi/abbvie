/* eslint-disable */
/* global WebImporter */

/**
 * Parser: quote
 * Source (our-stories in-article pull quotes): .quote-wrapper > .quote.block
 *
 * Block rows (blocks/quote/quote.js — classified by content; matches the
 * authored pga-tour page):
 *   1. (optional) background <picture> alone — only when the source quote has
 *      a background image outside the attribution (none on our-stories, so the
 *      block renders as quote-plain)
 *   2. quote text <p>(s)
 *   3. byline: avatar <picture>, name <p>, role <p> (one cell)
 */

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function validImg(img) {
  const src = img ? (img.getAttribute('src') || '').trim() : '';
  return !!src && src !== 'about:error';
}

export default function parse(element, { document }) {
  const cells = [];
  const attribution = element.querySelector('.quote-attribution');

  // 1. optional background image (any image outside the attribution)
  const bgImg = [...element.querySelectorAll('img')]
    .find((img) => !(attribution && attribution.contains(img)) && validImg(img));
  if (bgImg) {
    const pic = bgImg.closest('picture') || bgImg;
    if (!bgImg.hasAttribute('alt')) bgImg.setAttribute('alt', '');
    cells.push([pic]);
  }

  // 2. quote text
  const quotation = element.querySelector('.quote-quotation') || element.querySelector('blockquote');
  const quoteNodes = [];
  if (quotation) {
    [...quotation.children].forEach((c) => {
      if (attribution && (c === attribution || c.contains(attribution))) return;
      if (!text(c)) return;
      if (c.tagName === 'P') {
        quoteNodes.push(c);
      } else {
        const p = document.createElement('p');
        p.innerHTML = c.innerHTML;
        quoteNodes.push(p);
      }
    });
    if (!quoteNodes.length && text(quotation)) {
      const p = document.createElement('p');
      p.textContent = text(quotation);
      quoteNodes.push(p);
    }
  }
  if (quoteNodes.length) cells.push([quoteNodes]);

  // 3. byline
  if (attribution) {
    const byline = [];
    const avatar = attribution.querySelector('.quote-attribution-image picture')
      || attribution.querySelector('picture')
      || attribution.querySelector('img');
    const avatarImg = avatar && (avatar.tagName === 'IMG' ? avatar : avatar.querySelector('img'));
    if (avatar && validImg(avatarImg)) {
      if (!avatarImg.hasAttribute('alt')) avatarImg.setAttribute('alt', '');
      byline.push(avatar);
    }
    const name = text(attribution.querySelector('.quote-attribution-name'));
    const role = text(attribution.querySelector('.quote-attribution-title, cite'));
    [name, role].forEach((t) => {
      if (!t) return;
      const p = document.createElement('p');
      p.textContent = t;
      byline.push(p);
    });
    if (byline.length) cells.push([byline]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote', cells });
  element.replaceWith(block);
}
