/* eslint-disable */
/* global WebImporter */

/**
 * Parser: story-cards
 * Sources:
 *   - Related Content band (partner-with-us s3, our-stories s4), the element
 *     right after the "Related Content" title section:
 *       .grid-container-inner:has(> .grid-section.grid-cols-6.story-card-container)
 *   - our-stories article sidebar (single card):
 *       .grid-section.grid-cols-2.story-card-container > .story-card-wrapper
 *
 * Block rows (blocks/story-cards/story-cards.js; matches the authored
 * pga-tour page): one row per card
 *   [ <picture> | date <p>, category <p>, <h4> title, optional description <p>,
 *     <p><a href>CTA label</a></p> (READ STORY / LEARN MORE / ...),
 *     optional reading-time <p> ]
 * Fields missing in the source card are omitted.
 * Option: `compact-bottom` for a Related Content grid without the source's
 * `padding-bottom` class (144px below the cards instead of padding + 112px).
 */

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function validImg(img) {
  const src = img ? (img.getAttribute('src') || '').trim() : '';
  return !!src && src !== 'about:error';
}

function makeP(document, str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p;
}

function buildRow(card, document) {
  const link = card.querySelector('a.story-card-link[href]') || card.querySelector('a[href]');
  const href = link ? link.getAttribute('href') : '';

  // image
  let media = '';
  const pic = card.querySelector('.story-card-image picture') || card.querySelector('picture');
  const img = pic ? pic.querySelector('img') : card.querySelector('.story-card-image img, img');
  if (validImg(img)) {
    const newImg = document.createElement('img');
    newImg.setAttribute('src', img.getAttribute('src'));
    newImg.setAttribute('alt', img.getAttribute('alt') || '');
    media = newImg;
  }

  const body = [];
  const date = text(card.querySelector('.story-card-date, time'));
  if (date) body.push(makeP(document, date));
  const category = text(card.querySelector('.story-card-eyebrow, .card-eyebrow'));
  if (category) body.push(makeP(document, category));

  const titleEl = card.querySelector('.story-card-title, .card-title, h2, h3, h4, h5, h6');
  const title = text(titleEl);
  if (title) {
    const h4 = document.createElement('h4');
    h4.textContent = title;
    body.push(h4);
  }

  const desc = text(card.querySelector('.story-card-description, .card-description'));
  if (desc) body.push(makeP(document, desc));

  const ctaLabel = text(card.querySelector('.story-card-cta, .card-cta')) || (href ? 'READ STORY' : '');
  if (href && ctaLabel) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = ctaLabel;
    p.append(a);
    body.push(p);
  }

  const readTime = text(card.querySelector('.story-card-read-time'));
  if (readTime) body.push(makeP(document, readTime));

  if (!media && !body.length) return null;
  return [media, body.length ? body : ''];
}

export default function parse(element, { document }) {
  let cards;
  if (element.matches('.story-card-wrapper')) {
    cards = [element.querySelector('.story-card') || element];
  } else {
    cards = [...element.querySelectorAll('.story-card-wrapper > .story-card')];
    if (!cards.length) cards = [...element.querySelectorAll('.story-card')];
  }

  const cells = [];
  cards.forEach((card) => {
    const row = buildRow(card, document);
    if (row) cells.push(row);
  });

  // a Related Content grid without the source's `padding-bottom` class is followed by a
  // shorter spacer (144px total instead of padding + 112px): the compact-bottom option
  const container = element.matches('.story-card-wrapper') ? null : element.closest('.grid-container');
  const compact = !!container && !container.classList.contains('padding-bottom');

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'story-cards',
    variants: compact ? ['compact-bottom'] : [],
    cells,
  });
  element.replaceWith(block);
}
