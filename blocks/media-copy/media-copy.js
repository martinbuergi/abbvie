/**
 * media-copy — an image column beside a heading + copy column in the source's 12-column grid
 * (image span 4, one empty column, copy span 6; on mobile the image leads). Decode tier:
 * template-slotted. Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json
 * (section 3). Ground (mist, spaced) is the section style.
 *
 * Authoring: one row — the <picture> cell, then the cell with the <h2> and paragraphs (any order
 * or one flattened cell: the first image is the media, everything else is copy).
 */

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

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
  const grid = el('div', 'grid grid-pad-bottom');
  const mediaCol = el('div', 'span-4 m-order-1');
  const spacer = el('div', 'span-1');
  const copy = el('div', 'span-6 m-order-3 copy');
  let mediaDone = false;
  nodes.forEach((node) => {
    const isMedia = node.matches('picture, img')
      || (node.tagName === 'P' && node.querySelector('picture, img') && !node.textContent.trim());
    if (isMedia && !mediaDone) {
      const figure = el('div', 'figure');
      figure.append(node);
      mediaCol.append(figure);
      mediaDone = true;
    } else {
      copy.append(node);
    }
  });
  grid.append(mediaCol, spacer, copy);
  block.replaceChildren(grid);
}
