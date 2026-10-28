/* eslint-disable */
/* global WebImporter */

/**
 * AbbVie cleanup transformer (shared by student-and-new-graduates,
 * partner-with-us and our-stories templates).
 *
 * beforeTransform: removes non-authorable site chrome that could interfere
 * with block matching. It intentionally does NOT remove:
 *  - .separator-wrapper elements (block selectors such as
 *    ".separator-wrapper + .inner-grid-wrapper" depend on them),
 *  - #section-bg-6 > img (columns-photo-bg parser reads it via the section),
 *  - sibling .inner-grid-wrapper rows (cards-icon-features / cards-checklist
 *    parsers consume them),
 *  - nav elements inside <main> (dashboard-card-link-list uses <nav>).
 *
 * afterTransform: final cleanup of leftovers (spacer separators, empty
 * wrappers, leftover background image, tracking attributes). HTML comments
 * are never removed.
 */

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

function hasMeaningfulContent(el) {
  if (el.querySelector('img, picture, video, iframe, table, hr, a, h1, h2, h3, h4, h5, h6, ul, ol, blockquote')) return true;
  return el.textContent.replace(/ /g, ' ').trim().length > 0;
}

function hasComment(el) {
  const doc = el.ownerDocument;
  const walker = doc.createTreeWalker(el, 128 /* NodeFilter.SHOW_COMMENT */);
  return !!walker.nextNode();
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    removeAll(element, [
      // global chrome
      'header',
      '.header-wrapper',
      'footer',
      '.footer-wrapper',
      '#nav-backdrop',
      'a.skip-link',
      'button.back-to-top',
      // cookie consent (OneTrust)
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter',
      // NOTE: .breadcrumb-wrapper is kept here — it lives inside the hero
      // block and the hero parser authors it as the breadcrumb row.
      // Leftovers are removed in afterTransform.
      // accordion widget controls (not authorable)
      'button.accordion-expand-all',
      // non-content elements
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
      'meta',
    ]);

    // Tracking pixels and empty placeholder divs appended to <body>.
    const doc = element.ownerDocument;
    const body = doc.body || element;
    [...body.children].forEach((child) => {
      const tag = child.tagName;
      if (tag === 'MAIN') return;
      if (tag === 'IMG' || tag === 'IFRAME') {
        child.remove();
        return;
      }
      if (tag === 'DIV' && !child.id && !hasMeaningfulContent(child)) {
        child.remove();
      }
    });

    // Broken images (e.g. accordion-plus panels on partner-with-us).
    element.querySelectorAll('img').forEach((img) => {
      const src = (img.getAttribute('src') || '').trim();
      if (src === 'about:error' || src === '') {
        const parent = img.parentElement;
        const picture = img.closest('picture');
        (picture || img).remove();
        if (parent && parent.tagName === 'P' && !hasMeaningfulContent(parent)) {
          parent.remove();
        }
      }
    });
  }

  if (hookName === 'afterTransform') {
    // Leftover chrome that a parser might not have consumed.
    removeAll(element, [
      'header',
      'footer',
      '#onetrust-consent-sdk',
      '.breadcrumb-wrapper',
      '.hero-container-item-authoring-data',
      'script',
      'style',
      'noscript',
      'link',
      'meta',
    ]);

    // Leftover buttons outside of block tables (video play button, etc.).
    element.querySelectorAll('button').forEach((btn) => {
      if (!btn.closest('table')) btn.remove();
    });

    // Leftover columns-photo-bg background image (parser should have used it).
    element.querySelectorAll('#section-bg-6 > img, #section-bg-6 > picture').forEach((el) => el.remove());

    // Spacer separators (keep divider separators; they are authored dividers).
    element.querySelectorAll('.separator-wrapper').forEach((wrap) => {
      if (wrap.closest('table')) return;
      if (!wrap.querySelector('.separator-divider') && !wrap.querySelector('hr')) {
        wrap.remove();
      }
    });

    // Empty layout wrappers left behind after parsers consumed sibling rows.
    const wrapperSelectors = [
      '.inner-grid-wrapper',
      '.inner-grid-col',
      '.grid-container-inner',
      '.grid-section',
      '.custom-image-wrapper',
      '.text-container-wrapper',
      '.eyebrow-text-wrapper',
    ];
    // Run twice so that nested empty wrappers collapse.
    for (let pass = 0; pass < 2; pass += 1) {
      element.querySelectorAll(wrapperSelectors.join(',')).forEach((el) => {
        if (el.closest('table')) return;
        if (hasComment(el)) return;
        if (!hasMeaningfulContent(el)) el.remove();
      });
    }

    // Tracking / runtime attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (n === 'data-excat-section-id' || n === 'data-excat-section-first') return;
        if (n.startsWith('data-') || n.startsWith('on') || n === 'aria-hidden' || n === 'tabindex') {
          el.removeAttribute(n);
        }
      });
    });
  }
}
