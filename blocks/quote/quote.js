/**
 * quote — the pull-quote band (source quote.css + section background): an authored background
 * image under a navy scrim, the quote mark, the quote text and the byline (avatar, name, role).
 * Decode tier: template-slotted.
 * Schema: stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json (section 4).
 *
 * Authoring rows (classified by content):
 *   - background: a row holding only a <picture> (editorial)
 *   - quote: the paragraph(s) of a row without an image
 *   - byline: a row holding the avatar <picture> plus the name <p> then the role <p>
 */

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

const isMedia = (n) => n.matches('picture, img')
  || (n.tagName === 'P' && n.querySelector('picture, img') && !n.textContent.trim());

/** One row's authored elements; a media-led cell folded into one <p> is expanded (#104). */
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

export default async function decorate(block) {
  let background = null;
  let avatar = null;
  const quoteNodes = [];
  const bylineNodes = [];
  [...block.children].forEach((row) => {
    const nodes = rowNodes(row);
    const media = nodes.filter(isMedia);
    const texts = nodes.filter((n) => !isMedia(n));
    if (media.length && !texts.length) {
      if (!background) [background] = media;
      else if (!avatar) [avatar] = media;
    } else if (media.length) {
      if (!avatar) [avatar] = media;
      bylineNodes.push(...texts);
    } else {
      quoteNodes.push(...texts);
    }
  });

  const layer = el('div', 'quote-bg');
  if (background) layer.append(background);

  const inner = el('div', 'quote-inner');
  const body = el('blockquote', 'quote-body');
  const text = el('div', 'quote-text');
  text.append(...quoteNodes);
  body.append(text);

  if (avatar || bylineNodes.length) {
    const by = el('div', 'quote-by');
    if (avatar) {
      const pic = el('div', 'quote-avatar');
      pic.append(avatar);
      by.append(pic);
    }
    const who = el('div', 'quote-who');
    if (bylineNodes[0]) {
      const name = el('div', 'quote-name');
      name.append(bylineNodes[0]);
      who.append(name);
    }
    if (bylineNodes.length > 1) {
      const role = el('div', 'quote-role');
      role.append(...bylineNodes.slice(1));
      who.append(role);
    }
    by.append(who);
    body.append(by);
  }
  inner.append(body);
  block.replaceChildren(layer, inner);
}
