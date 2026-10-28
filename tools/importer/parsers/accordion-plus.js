/* eslint-disable */
/* global WebImporter */

/**
 * Parser: accordion-plus
 * Source: .accordion-wrapper > .accordion.block (all three templates)
 *
 * Block rows (blocks/accordion-plus/accordion-plus.js): one row per item
 *   [ title cell (plain label text) | content cell (paragraphs, lists, links, optional headshot picture first) ]
 *
 * The small eyebrow label shown beside "Expand All" on the source
 * (.accordion-block-heading, e.g. "programs", "investment team") is default
 * content authored right before the block, so it is emitted as a <p> before
 * the block table. The Expand All button is UI and is never authored.
 * Broken placeholder images (src about:error / empty) are dropped.
 */

function isBrokenImg(img) {
  const src = (img.getAttribute('src') || '').trim();
  return !src || src === 'about:error';
}

function hasContent(node) {
  if (node.nodeType === 3) return node.textContent.trim().length > 0;
  if (node.nodeType !== 1) return false;
  if (node.querySelector('img, picture, video, iframe, table, hr')) return true;
  if (/^(IMG|PICTURE|HR)$/.test(node.tagName)) return true;
  return node.textContent.replace(/ /g, ' ').trim().length > 0;
}

export default function parse(element, { document }) {
  // eyebrow label -> default content before the block
  const headingEl = element.querySelector('.accordion-block-heading');
  const headingText = headingEl ? headingEl.textContent.replace(/\s+/g, ' ').trim() : '';

  let items = [...element.querySelectorAll(':scope > details.accordion-item, :scope > details')];
  if (!items.length) items = [...element.querySelectorAll('.accordion-item')];

  const cells = [];
  items.forEach((item) => {
    const labelEl = item.querySelector('.accordion-item-label-text')
      || item.querySelector('summary')
      || item.querySelector('.accordion-item-label');
    const title = labelEl ? labelEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!title) return;

    const body = item.querySelector('.accordion-item-body');
    const content = [];
    if (body) {
      // drop broken placeholder images (and their now-empty paragraphs)
      body.querySelectorAll('img').forEach((img) => {
        if (!isBrokenImg(img)) return;
        const pic = img.closest('picture');
        const holder = pic || img;
        const parent = holder.parentElement;
        holder.remove();
        if (parent && parent !== body && parent.tagName === 'P' && !hasContent(parent)) parent.remove();
      });

      [...body.children].forEach((child) => {
        // headshot wrapper: keep only the picture/img
        if (child.classList.contains('accordion-item-image')) {
          const pic = child.querySelector('picture') || child.querySelector('img');
          if (pic) content.push(pic);
          return;
        }
        if (!hasContent(child)) return;
        content.push(child);
      });
    }

    cells.push([title, content.length ? content : '']);
  });

  if (!cells.length) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-plus', cells });

  if (headingText) {
    const p = document.createElement('p');
    p.textContent = headingText;
    element.before(p);
  }
  element.replaceWith(block);
}
