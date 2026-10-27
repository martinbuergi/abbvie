/**
 * story-cards — the "Related Content" story cards (source story-card): image beside date,
 * category, title, READ STORY and reading time; the whole card is the link.
 * Decode tier: reconstructive (one row per card; authors add or remove cards).
 * Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json (section 8).
 * Ground (mist, bleed) is the section style; the section title is default content in the
 * section before (h5 "Related Content").
 *
 * Card row: <picture> | date <p>, category <p> (optional; exposed as a level-2 heading like the
 * source's outline), title heading (the block's most frequent heading tag), the story link
 * (<a> alone in its paragraph — its text is the card's CTA label), reading time <p>.
 * Fields are classified by content, not position: a date-shaped line before the title is the
 * date, other lines before it the category, link-free lines after it the reading time.
 * A single flattened cell holding several cards is segmented on the title headings.
 */

const DATE = /^[A-Za-z]+\.? \d{1,2}, \d{4}$/;

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function wrap(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}

/** Authored elements of a row; a media-led cell folded into one <p> is expanded (#104). */
function rowNodes(row) {
  const out = [];
  row.querySelectorAll(':scope > div').forEach((cell) => {
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

const isHeading = (n) => /^H[1-6]$/.test(n.tagName);

/** The card-title tag: the most frequent heading tag in the block (ties → the deeper level). */
function titleTagOf(block) {
  const counts = {};
  block.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    counts[h.tagName] = (counts[h.tagName] || 0) + 1;
  });
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || b.localeCompare(a));
  return tags[0] || 'H3';
}
const isMedia = (n) => n.matches('picture, img')
  || (n.querySelector('picture, img') && !n.textContent.trim());

/** Split a flat node list into cards on the title headings. */
function segment(nodes, titleTag) {
  const isTitle = (n) => n.tagName === titleTag;
  const groups = [];
  let cur = null;
  let afterHeading = false;
  nodes.forEach((n) => {
    const opensCard = !cur || (afterHeading && (isMedia(n) || isHeading(n)
      || (!n.querySelector('a[href]') && DATE.test(n.textContent.trim()))));
    if (opensCard) {
      cur = [];
      groups.push(cur);
      afterHeading = false;
    }
    cur.push(n);
    if (isTitle(n)) afterHeading = true;
  });
  return groups;
}

function buildCard(nodes, titleTag) {
  let media = null;
  let heading = null;
  let ctaP = null;
  let href = '';
  const before = [];
  const after = [];
  nodes.forEach((n) => {
    if (!media && isMedia(n)) {
      media = n;
    } else if (!heading && n.tagName === titleTag) {
      heading = n;
    } else if (!ctaP && n.querySelector('a[href]')) {
      ctaP = n;
      href = n.querySelector('a[href]').href;
    } else if (!heading) {
      before.push(n);
    } else {
      after.push(n);
    }
  });

  const card = el('article', 'span-6 story-card');
  const link = el('a', 'story-card-link', href ? { href } : {});
  if (media) link.append(wrap(media, 'story-card-media'));

  const body = el('div', 'story-card-body');
  const meta = el('div', 'story-card-meta');
  before.forEach((n) => {
    const isDate = DATE.test(n.textContent.trim()) && !meta.querySelector('.story-card-date');
    const field = wrap(n, isDate ? 'story-card-date' : 'story-card-eyebrow');
    // the source outlines a card's category as a level-2 heading; a <p> category keeps that
    // semantics on its wrapper (an authored heading already carries it)
    if (!isDate && !isHeading(n)) {
      field.setAttribute('role', 'heading');
      field.setAttribute('aria-level', '2');
    }
    meta.append(field);
  });
  if (meta.children.length) body.append(meta);
  if (heading) body.append(wrap(wrap(heading, 'story-card-title'), 'story-card-text'));

  const foot = el('div', 'story-card-foot');
  if (ctaP) {
    // EW6: the card is the link — unwrap the authored anchor, keep its indexed paragraph
    const a = ctaP.querySelector('a[href]');
    a.replaceWith(...a.childNodes);
    foot.append(wrap(ctaP, 'story-card-cta'));
  }
  after.forEach((n) => foot.append(wrap(n, 'story-card-time')));
  if (foot.children.length) body.append(foot);
  link.append(body);
  card.append(link);
  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const perRow = rows.map(rowNodes).filter((nodes) => nodes.length);
  const titleTag = titleTagOf(block);
  const groups = perRow.length > 1 ? perRow : segment(perRow.flat(), titleTag);
  const grid = el('div', 'grid grid-no-top grid-pad-bottom');
  groups.forEach((nodes) => grid.append(buildCard(nodes, titleTag)));
  block.replaceChildren(grid);
}
