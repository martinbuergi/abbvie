/**
 * columns-photo-bg — a full-width photograph with white cards laid side by side over it
 * (source: "stay in touch" sign-up card | "join us" dashboard-card-link-list at the foot of the
 * New Graduates page). Decode tier: template-slotted.
 *
 * Authoring rows (classified by content, any order):
 *   - background: the first row holding only a <picture> (editorial; empty alt if decorative)
 *   - cards: every cell of the other rows is one card, in authored order — on desktop the first
 *     card takes 4 of 12 columns and the second 8 (more cards share the row evenly)
 * Inside a card, a short link-free <p> right before a heading or at the top is an eyebrow. A
 * card holding a <ul>/<ol> of links is a link-list card: eyebrow on top, then the remaining
 * text (heading) beside the list.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** Same rule as scripts.js: other hosts are external, abbvie.com counts as the own site. */
function isExternal(a) {
  try {
    const { hostname } = new URL(a.href, window.location.href);
    return hostname !== window.location.hostname && !/^(www\.)?abbvie\.com$/.test(hostname);
  } catch {
    return false;
  }
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

const isMediaOnly = (node) => node.querySelector('picture, img') && !node.textContent.trim();

function isEyebrow(n, i, arr) {
  const next = arr[i + 1];
  return n.tagName === 'P' && !n.querySelector('a, picture, img') && n.textContent.trim().length <= 40
    && (i === 0 || (next && /^H[1-6]$/.test(next.tagName))) && arr.length > 1;
}

function buildCard(cell) {
  const card = el('div', 'columns-photo-bg-card');
  const nodes = cellNodes(cell);
  const list = nodes.find((n) => /^(UL|OL)$/.test(n.tagName) && n.querySelector('a'));
  const rest = nodes.filter((n) => n !== list);
  rest.forEach((n, i, arr) => {
    if (isEyebrow(n, i, arr)) n.classList.add('columns-photo-bg-eyebrow');
  });

  // CTA links (decorated by aem.js decorateButtons) read as the source's text-link CTA
  rest.forEach((n) => n.querySelectorAll('a.button').forEach((a) => {
    if (isExternal(a)) a.classList.add('external');
  }));

  if (!list) {
    card.append(...rest);
    return card;
  }

  card.classList.add('columns-photo-bg-card-has-list');
  const eyebrow = rest.find((n) => n.classList.contains('columns-photo-bg-eyebrow'));
  if (eyebrow) card.append(eyebrow);
  const content = el('div', 'columns-photo-bg-card-content');
  const text = el('div', 'columns-photo-bg-card-text');
  text.append(...rest.filter((n) => n !== eyebrow));
  const nav = el('nav', 'columns-photo-bg-card-list');
  const heading = text.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) nav.setAttribute('aria-label', heading.textContent.trim());
  list.querySelectorAll('a').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary');
    a.closest('.button-wrapper, .button-container')?.classList.remove('button-wrapper', 'button-container');
  });
  nav.append(list);
  if (text.children.length) content.append(text);
  content.append(nav);
  card.append(content);
  return card;
}

export default function decorate(block) {
  let background = null;
  const cells = [];
  [...block.children].forEach((row) => {
    if (!background && isMediaOnly(row)) {
      background = row.querySelector('picture') || row.querySelector('img');
      return;
    }
    [...row.children].forEach((cell) => {
      if (cell.textContent.trim() || cell.querySelector('picture, img')) cells.push(cell);
    });
  });

  const bg = el('div', 'columns-photo-bg-media');
  if (background) {
    const img = background.tagName === 'IMG' ? background : background.querySelector('img');
    if (img && !/\.svg(\?|$)/i.test(img.src)) {
      bg.append(createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 1024px)', width: '2000' }, { width: '750' },
      ]));
    } else {
      bg.append(background);
    }
  } else {
    block.classList.add('columns-photo-bg-no-media');
  }

  const cards = el('div', 'columns-photo-bg-cards');
  cards.classList.add(`columns-photo-bg-${cells.length}-cards`);
  cells.forEach((cell) => cards.append(buildCard(cell)));

  block.replaceChildren(bg, cards);
}
