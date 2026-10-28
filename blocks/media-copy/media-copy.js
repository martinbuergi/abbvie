/**
 * media-copy — an image column beside a heading + copy column in the source's 12-column grid
 * (image span 4, one empty column, copy span 6; on mobile the image leads). Decode tier:
 * template-slotted. Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json
 * (section 3). Ground (mist, spaced) is the section style.
 *
 * Authoring: one row — the <picture> cell, then the cell with the <h2> and paragraphs (any order
 * or one flattened cell: the first image is the media, everything else is copy).
 * When the row has separate cells, other content authored in the picture's cell (e.g. a small
 * heading "Recruitment timeline" above the picture) stays in the media column, in order.
 * In the copy, a short link-free <p> right before a heading is an eyebrow; an <hr> is a divider.
 * Option: `wide-media` — the source's inner-grid cols-5-1-6 mobile-reverse: media column spans
 * 5 columns (5-1-6 grid) instead of 4 (4-1-6), the grid sits half a section column in from the
 * band on desktop, and on mobile the copy column comes first.
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

const isMediaNode = (node) => node.matches('picture, img')
  || (node.tagName === 'P' && node.querySelector('picture, img') && !node.textContent.trim());

/** The cell holding the first picture, when the row has more than one non-empty cell. */
function mediaCellOf(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')]
    .filter((c) => c.children.length);
  if (cells.length < 2) return null;
  return cells.find((c) => c.querySelector('picture, img')) || null;
}

function markEyebrows(copy) {
  [...copy.children].forEach((node) => {
    const next = node.nextElementSibling;
    if (node.tagName === 'P' && next && /^H[1-6]$/.test(next.tagName)
      && !node.querySelector('a, picture, img') && node.textContent.trim().length <= 40) {
      node.classList.add('media-copy-eyebrow');
    }
  });
}

export default async function decorate(block) {
  const mediaCell = mediaCellOf(block);
  const nodes = collectNodes(block);
  const wide = block.classList.contains('wide-media');
  const grid = el('div', 'grid grid-pad-bottom');
  const mediaCol = el('div', `${wide ? 'span-5' : 'span-4'} m-order-1`);
  const spacer = el('div', 'span-1');
  const copy = el('div', 'span-6 m-order-3 copy');
  let mediaDone = false;
  nodes.forEach((node) => {
    const isMedia = isMediaNode(node);
    if (isMedia && !mediaDone) {
      const figure = el('div', 'figure');
      figure.append(node);
      mediaCol.append(figure);
      mediaDone = true;
    } else if (mediaCell && mediaCell.contains(node)) {
      const box = el('div', isMedia ? 'figure' : 'media-copy-media-text');
      box.append(node);
      mediaCol.append(box);
    } else {
      copy.append(node);
    }
  });
  markEyebrows(copy);
  // off-site CTAs carry the source's external-link arrow (styles.css a.button.external)
  copy.querySelectorAll('a.button').forEach((a) => {
    try {
      const { hostname } = new URL(a.href, window.location.href);
      if (hostname !== window.location.hostname && !/^(www\.)?abbvie\.com$/.test(hostname)) {
        a.classList.add('external');
      }
    } catch {
      // unparsable href: leave the button as authored
    }
  });
  grid.append(mediaCol, spacer, copy);
  block.replaceChildren(grid);
}
