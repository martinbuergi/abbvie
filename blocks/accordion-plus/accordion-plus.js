/**
 * accordion-plus — expand/collapse items with a plus/minus marker and divider rules (source
 * accordion "allowmultipleopen showexpandcollapseall accordion-icon-font"). Items open
 * independently; with more than one item an "Expand All" / "Collapse All" control is shown.
 * Decode tier: reconstructive (one row per item; authors add or remove items).
 *
 * Row: title cell (plain text, a <p> or a heading) | content cell (paragraphs, lists, links,
 * an optional headshot <picture> leading the content).
 * A single-cell row uses its first element as the title and the rest as the content.
 * Rows without a title are dropped; broken placeholder images (src about:error) are removed.
 *
 * Eyebrow label: on the source the label ("programs", "investment team") sits in the block's
 * own heading row, beside the Expand All control. It is authored as default content right
 * before the block (scripts.js marks it `p.block-heading`); the block takes a copy into its
 * heading row and hides the original, so the section's spacing rules keyed on that paragraph
 * keep working.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

let uid = 0;

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
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

/** Title and content nodes of one row, tolerant of flattened / missing cells. */
function splitRow(row) {
  const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture, img'));
  if (!cells.length) return null;
  if (cells.length === 1) {
    const [first, ...rest] = cellNodes(cells[0]);
    if (!first) return { title: [...cells[0].childNodes], content: [] };
    return { title: [first], content: rest };
  }
  const [titleCell, ...contentCells] = cells;
  return {
    title: [...titleCell.childNodes],
    content: contentCells.flatMap((c) => (c.children.length ? cellNodes(c) : [...c.childNodes])),
  };
}

function decoratePanel(panel) {
  panel.querySelectorAll('img[src="about:error"], img:not([src])').forEach((img) => {
    const p = img.closest('p');
    if (p && !p.textContent.trim() && p.querySelectorAll('img').length === 1) p.remove();
    else img.remove();
  });
  panel.querySelectorAll('picture > img').forEach((img) => {
    const pic = img.closest('picture');
    if (!/\.svg(\?|$)/i.test(img.src)) {
      pic.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    }
  });
  // a headshot leading the content sits above the text, five grid columns wide
  const first = panel.firstElementChild;
  if (first && first.querySelector('picture') && !first.textContent.trim()) {
    first.classList.add('accordion-plus-image');
  }
  // links leaving the site carry the external-link arrow and open in a new tab (source)
  panel.querySelectorAll('a[href]').forEach((a) => {
    let url;
    try {
      url = new URL(a.href, window.location.href);
    } catch (e) {
      return;
    }
    if (!/^https?:$/.test(url.protocol)) return;
    if (url.host !== window.location.host && url.host !== 'www.abbvie.com') {
      a.classList.add('accordion-plus-external');
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

/** The eyebrow label authored as the last paragraph of the default content right before. */
function findLabel(block) {
  const wrapper = block.closest('.accordion-plus-wrapper') || block;
  const prev = wrapper.previousElementSibling;
  if (!prev || !prev.matches('.default-content-wrapper')) return null;
  const last = prev.lastElementChild;
  return last && last.matches('p.block-heading') && last.textContent.trim() ? last : null;
}

export default function decorate(block) {
  uid += 1;
  const items = [];
  const list = el('div', 'accordion-plus-items');
  [...block.children].forEach((row, i) => {
    const parts = splitRow(row);
    if (!parts) return;
    const titleText = parts.title.map((n) => n.textContent).join(' ').trim();
    if (!titleText) return;

    const details = el('details', 'accordion-plus-item');
    const summary = el('summary', 'accordion-plus-label');
    const label = el('span', 'accordion-plus-label-text');
    // keep authored inline markup of the title, unwrap a single block element (p / heading)
    const titleNodes = parts.title.length === 1 && parts.title[0].nodeType === 1
      && /^(P|H[1-6])$/.test(parts.title[0].tagName) ? [...parts.title[0].childNodes] : parts.title;
    label.append(...titleNodes);
    summary.append(label);

    const body = el('div', 'accordion-plus-body', { id: `accordion-plus-${uid}-${i}` });
    body.append(...parts.content);
    decoratePanel(body);
    summary.setAttribute('aria-controls', body.id);

    details.append(summary, body);
    list.append(details);
    items.push(details);
  });

  const children = [];
  const labelEl = findLabel(block);
  if (labelEl || items.length > 1) {
    const toolbar = el('div', 'accordion-plus-toolbar');
    if (labelEl) {
      const heading = el('p', 'accordion-plus-heading');
      heading.append(...[...labelEl.childNodes].map((n) => n.cloneNode(true)));
      toolbar.append(heading);
      // the label paragraph followed other copy: keep its gap above the heading row
      if (labelEl.previousElementSibling) block.classList.add('accordion-plus-after-copy');
      labelEl.hidden = true;
    }
    if (items.length > 1) {
      const toggle = el('button', 'accordion-plus-toggle-all', { type: 'button', 'aria-expanded': 'false' });
      const text = el('span', 'accordion-plus-toggle-all-text');
      text.textContent = 'Expand All';
      toggle.append(text, el('span', 'accordion-plus-toggle-all-icon', { 'aria-hidden': 'true' }));
      const sync = () => {
        const allOpen = items.every((d) => d.open);
        toggle.setAttribute('aria-expanded', String(allOpen));
        toggle.classList.toggle('expanded', allOpen);
        text.textContent = allOpen ? 'Collapse All' : 'Expand All';
      };
      toggle.addEventListener('click', () => {
        const open = !items.every((d) => d.open);
        items.forEach((d) => { d.open = open; });
        sync();
      });
      items.forEach((d) => d.addEventListener('toggle', sync));
      toolbar.append(toggle);
    }
    children.push(toolbar);
  }
  children.push(list);
  block.replaceChildren(...children);
}
