/**
 * copy-band — a heading, body copy, footnote and an optional figure in the source's 12-column
 * grid, the copy column offset by two columns (source section.css grid-container, "About" band).
 * Decode tier: template-slotted.
 * Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json (section 1).
 * Ground (sky) is the section style.
 *
 * Authoring: one cell (or several) holding, in reading order, the <h2>, the paragraphs and an
 * optional <picture>; every authored element is moved into the copy column in authored order.
 */

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** Authored elements in order; a media-led cell folded into one <p> is expanded (#104). */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((child) => {
      if (child.tagName === 'P' && child.querySelector('picture, img') && child.children.length > 1) {
        out.push(...child.children);
      } else {
        out.push(child);
      }
    });
  });
  return out;
}

export default async function decorate(block) {
  const nodes = collectNodes(block);
  const grid = el('div', 'grid');
  const spacer = el('div', 'span-2 m-order-2');
  const copy = el('div', 'span-8 copy');
  nodes.forEach((node) => {
    if (node.matches('picture, img') || (node.tagName === 'P' && node.querySelector('picture, img')
      && !node.textContent.trim())) {
      const figure = el('div', 'figure');
      figure.append(node);
      copy.append(figure);
    } else {
      copy.append(node);
    }
  });
  grid.append(spacer, copy);
  block.replaceChildren(grid);
}
