/**
 * cta-band — heading + line of copy beside one call to action, in the source's 12-column grid
 * (copy span 7, one empty column, CTA span 3; source cta.css default-cta). Decode tier:
 * template-slotted. Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json
 * (section 6). Ground (sky, short) is the section style.
 *
 * Authoring: one row — the copy cell (<h3> + <p>) and the CTA cell (<strong><a>, buttonized by
 * decorateButtons). Any link-bearing paragraph is a CTA, wherever it was authored.
 */

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

export default async function decorate(block) {
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => nodes.push(...cell.children));
  const grid = el('div', 'grid');
  const copy = el('div', 'span-7 copy');
  const actions = el('div', 'span-3 actions');
  nodes.forEach((node) => {
    const link = node.matches('a') ? node : node.querySelector('a[href]');
    if (link && (node.textContent.trim() === link.textContent.trim())) actions.append(node);
    else copy.append(node);
  });
  grid.append(copy, el('div', 'span-1'), actions);
  block.replaceChildren(grid);
}
