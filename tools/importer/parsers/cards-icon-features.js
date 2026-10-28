/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-icon-features
 * Source (student-and-new-graduates program sections):
 *   .text-container-wrapper + .inner-grid-wrapper > .inner-grid.cols-6-6
 * The 2x2 icon grid is rendered as two sibling
 * .inner-grid-wrapper > .inner-grid.cols-6-6 rows; the mapped element is the
 * first. The parser also consumes the following sibling grid rows and
 * removes them so they are not imported again as default content.
 *
 * Block rows (blocks/cards-icon-features/cards-icon-features.js): one row per item
 *   [ icon picture (small svg) | text <p> ]
 */

const ROW_SELECTOR = '.inner-grid.cols-6-6';

function validImg(img) {
  const src = img ? (img.getAttribute('src') || '').trim() : '';
  return !!src && src !== 'about:error';
}

function extractItem(col, document) {
  let icon = '';
  const pic = col.querySelector('.custom-image picture') || col.querySelector('picture');
  const img = pic ? pic.querySelector('img') : col.querySelector('img');
  if (validImg(img)) icon = pic || img;

  const textRoot = col.querySelector('.text-container > div') || col.querySelector('.text-container');
  const text = [];
  if (textRoot) {
    [...textRoot.children].forEach((child) => {
      if (child.textContent.trim()) text.push(child);
    });
    if (!text.length && textRoot.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = textRoot.textContent.trim();
      text.push(p);
    }
  }
  if (!icon && !text.length) return null;
  return [icon, text.length ? text : ''];
}

export default function parse(element, { document }) {
  const grids = [element];
  const consumed = [];
  const wrapper = element.parentElement && element.parentElement.classList.contains('inner-grid-wrapper')
    ? element.parentElement
    : null;
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
    let cols = [...grid.querySelectorAll(':scope > .inner-grid-container > .inner-grid-col')];
    if (!cols.length) cols = [...grid.querySelectorAll('.inner-grid-col')];
    cols.forEach((col) => {
      const row = extractItem(col, document);
      if (row) cells.push(row);
    });
  });

  consumed.forEach((el) => el.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-features', cells });
  element.replaceWith(block);
}
