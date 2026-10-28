/**
 * cards-icon-features — short feature items, each a small icon above a line of text, laid out
 * two per row from 744px (one per row on mobile). Source: the 2x2 icon + text grid of the
 * "New Graduates & Entry-Level positions" program sections. Decode tier: reconstructive
 * (one row per item; authors add or remove items).
 *
 * Row: icon <picture>/<img> (small SVG; decorative unless alt is authored) | text <p>(s).
 * Cells are classified by content: the first image is the icon, everything else the text.
 * A row without an icon still renders its text; empty rows are dropped.
 */

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** A cell's authored elements; a media-led cell folded into one <p> (aem.js) is expanded. */
function cellNodes(cell) {
  const out = [];
  [...cell.children].forEach((child) => {
    if (child.tagName === 'P' && child.querySelector('picture, img') && child.children.length > 1) {
      out.push(...child.children);
    } else {
      out.push(child);
    }
  });
  return out;
}

const isMedia = (n) => n.matches('picture, img')
  || (n.tagName === 'P' && n.querySelector('picture, img') && !n.textContent.trim());

export default function decorate(block) {
  const list = el('ul', 'cards-icon-features-list');
  [...block.children].forEach((row) => {
    const nodes = [...row.children].flatMap(cellNodes);
    if (!nodes.length) return;
    const item = el('li', 'cards-icon-features-item');
    const icon = el('div', 'cards-icon-features-icon');
    const body = el('div', 'cards-icon-features-body');
    nodes.forEach((n) => {
      if (!icon.children.length && isMedia(n)) icon.append(n);
      else body.append(n);
    });
    if (icon.children.length) item.append(icon);
    if (body.children.length) item.append(body);
    if (item.children.length) list.append(item);
  });
  block.replaceChildren(list);
}
