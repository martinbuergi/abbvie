/**
 * cards-checklist — a stacked list of check-marked statements: a small check icon beside text
 * that opens with a bold lead sentence (source: "Key Takeaways" on the our-stories article).
 * Decode tier: reconstructive (one row per item; authors add or remove items).
 *
 * Row: icon <picture>/<img> (checkmark-in-circle SVG) | text <p> with a <strong> lead.
 * Cells are classified by content: the first image is the icon, everything else the text.
 * A row without an icon keeps an empty marker slot (text stays aligned); empty rows are dropped.
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
  const list = el('ul', 'cards-checklist-list');
  [...block.children].forEach((row) => {
    const nodes = [...row.children].flatMap(cellNodes);
    if (!nodes.length) return;
    const item = el('li', 'cards-checklist-item');
    const icon = el('div', 'cards-checklist-icon');
    const body = el('div', 'cards-checklist-body');
    nodes.forEach((n) => {
      if (!icon.children.length && isMedia(n)) icon.append(n);
      else body.append(n);
    });
    if (!body.children.length) return;
    item.append(icon, body);
    list.append(item);
  });
  block.replaceChildren(list);
}
