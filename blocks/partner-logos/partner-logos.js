/**
 * partner-logos — the "Partnerships For Impact" band (source custom-image tiles in the 12-column
 * grid): the section head (heading + lede) above a row of linked partner logos.
 * Decode tier: reconstructive (one row per logo; authors add or remove partners).
 * Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json (section 5).
 *
 * Section head: authored as DEFAULT CONTENT before the block (heading, then the lede paragraphs);
 * the block reabsorbs it into the grid (EW8). Leading block rows without an image are accepted
 * as the head too (decode fallback).
 * Logo rows: <picture> | partner URL (a link alone in its paragraph) | variant word.
 *
 * @variants cell 3: full | padded (default full) — padded insets the logo like the source tiles
 * @ew-exempt metadata — the partner URL (cell 2) and the variant word (cell 3) are never displayed
 */

const VARIANTS = ['full', 'padded'];

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

export default async function decorate(block) {
  const grid = el('div', 'grid');
  const head = el('div', 'span-10 m-order-1 logos-head');
  const lede = el('div', 'lede-block');

  const addToHead = (node) => {
    if (/^H[1-6]$/.test(node.tagName)) head.append(node);
    else lede.append(node);
  };

  // section head authored as default content before the block (EW8: move, then drop the wrapper)
  const wrapper = block.parentElement && block.parentElement.previousElementSibling;
  if (wrapper && wrapper.classList.contains('default-content-wrapper')) {
    [...wrapper.children].forEach(addToHead);
    wrapper.remove();
  }

  const tiles = [];
  [...block.children].forEach((row) => {
    const media = row.querySelector('picture, img');
    if (!media) {
      // decode fallback: an in-table head row
      row.querySelectorAll(':scope > div > *').forEach(addToHead);
      return;
    }
    const link = [...row.querySelectorAll('a[href]')].find((a) => !a.contains(media));
    const wrapping = media.closest('a');
    const href = (link && link.href) || (wrapping && wrapping.href) || '';
    const word = [...row.querySelectorAll(':scope > div')]
      .map((c) => c.textContent.trim().toLowerCase())
      .find((t) => VARIANTS.includes(t)) || 'full';

    const tile = el('div', `span-2 m-order-2 logo-tile${word === 'padded' ? ' logo-tile-padded' : ''}`);
    const box = el('div', 'logo-tile-img');
    if (href) {
      const a = el('a', '', { href });
      a.append(media);
      box.append(a);
    } else {
      box.append(media);
    }
    tile.append(box);
    tiles.push(tile);
  });

  if (lede.children.length) head.append(lede);
  if (head.children.length) grid.append(head);
  grid.append(el('div', 'span-1 m-order-2'), ...tiles);
  block.replaceChildren(grid);
}
