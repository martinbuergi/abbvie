/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-checklist
 * Source (our-stories "Key Takeaways"):
 *   .separator-wrapper + .inner-grid-wrapper > .inner-grid.cols-1-10-1
 * The source renders each checklist item as its own sibling
 * .inner-grid-wrapper > .inner-grid.cols-1-10-1; the mapped element is the
 * first one, so the parser also consumes the following sibling rows and
 * removes them so they are not imported again as default content.
 *
 * Block rows (blocks/cards-checklist/cards-checklist.js): one row per item
 *   [ icon picture (checkmark svg) | text <p> with <strong> lead ]
 */

const ROW_SELECTOR = '.inner-grid.cols-1-10-1';

function extractItem(grid) {
  const iconSrc = grid.querySelector('.inner-grid-col.span-1 picture')
    || grid.querySelector('.inner-grid-col.span-1 img')
    || grid.querySelector('.custom-image picture, .custom-image img');
  let icon = '';
  if (iconSrc) {
    const img = iconSrc.tagName === 'IMG' ? iconSrc : iconSrc.querySelector('img');
    const src = img ? (img.getAttribute('src') || '').trim() : '';
    if (img && src && src !== 'about:error') icon = iconSrc;
  }

  const textRoot = grid.querySelector('.text-container > div')
    || grid.querySelector('.text-container')
    || grid.querySelector('.inner-grid-col.span-10');
  const text = [];
  if (textRoot) {
    [...textRoot.children].forEach((child) => {
      if (child.textContent.trim()) text.push(child);
    });
    if (!text.length && textRoot.textContent.trim()) {
      const p = textRoot.ownerDocument.createElement('p');
      p.innerHTML = textRoot.innerHTML;
      text.push(p);
    }
  }
  if (!text.length) return null;
  return [icon, text];
}

export default function parse(element, { document }) {
  const grids = [element];

  // following sibling rows (each inside its own .inner-grid-wrapper)
  const wrapper = element.parentElement && element.parentElement.classList.contains('inner-grid-wrapper')
    ? element.parentElement
    : null;
  const consumed = [];
  if (wrapper) {
    let next = wrapper.nextElementSibling;
    while (next && next.classList.contains('inner-grid-wrapper')) {
      const grid = next.querySelector(`:scope > ${ROW_SELECTOR}`);
      if (!grid) break;
      grids.push(grid);
      consumed.push(next);
      next = next.nextElementSibling;
    }
  }

  const cells = [];
  grids.forEach((grid) => {
    const row = extractItem(grid);
    if (row) cells.push(row);
  });

  consumed.forEach((el) => el.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-checklist', cells });
  element.replaceWith(block);
}
