import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  readBlockConfig,
  toClassName,
  toCamelCase,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Applies a `section-metadata` table left in the markup to its section. The aem.page pipeline
 * already renders section metadata as classes on the section div (so in production this finds
 * nothing); the local html-folder preview serves the raw table, which would otherwise load as a
 * missing block and drop the section style.
 * @param {Element} main The main element (before decorateSections)
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > div > div.section-metadata').forEach((meta) => {
    const section = meta.parentElement;
    Object.entries(readBlockConfig(meta)).forEach(([key, value]) => {
      const values = [value].flat().filter((v) => typeof v === 'string');
      if (key === 'style') {
        values.flatMap((v) => v.split(','))
          .map((v) => toClassName(v.trim()))
          .filter(Boolean)
          .forEach((c) => section.classList.add(c));
      } else if (key) {
        section.dataset[toCamelCase(key)] = values.join(', ');
      }
    });
    meta.remove();
  });
}

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const LABEL_MAX = 40;

const isWrapper = (el) => el && el.classList.contains('default-content-wrapper');
const isBlockWrapper = (el) => el && !isWrapper(el) && !!el.querySelector(':scope > .block');

/** a short, single-line label paragraph: plain text or one <strong>, no sentence punctuation */
function isLabel(p) {
  if (!p || p.tagName !== 'P') return false;
  const text = p.textContent.trim();
  if (!text || text.length > LABEL_MAX || /[.!?:]$/.test(text)) return false;
  const kids = [...p.children];
  return kids.length === 0 || (kids.length === 1 && kids[0].tagName === 'STRONG'
    && kids[0].textContent.trim() === text);
}

/** a paragraph holding only an image */
const isMediaParagraph = (el) => el && el.tagName === 'P' && !!el.querySelector('picture, img')
  && !el.textContent.trim();

/** a paragraph holding exactly one link and nothing else */
function isLinkParagraph(p) {
  if (!p || p.tagName !== 'P') return false;
  const links = p.querySelectorAll('a[href]');
  return links.length === 1 && !links[0].querySelector('img')
    && p.textContent.trim() === links[0].textContent.trim();
}

function isExternal(a) {
  try {
    const { hostname } = new URL(a.href, window.location.href);
    return hostname !== window.location.hostname && !/^(www\.)?abbvie\.com$/.test(hostname);
  } catch {
    return false;
  }
}

function newWrapper(className, nodes = []) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

/**
 * Small default-content roles the source styles distinctly:
 * - `eyebrow`: a short label paragraph directly above a heading ("opportunities")
 * - `block-heading`: a short label paragraph closing its group, directly before a block
 *   ("programs", "details", "investment team")
 * - `media` / `caption`: an image-only paragraph and the all-italic paragraph right after it
 * @param {Element} section The section element
 */
function decorateDefaultContentRoles(section) {
  section.querySelectorAll(':scope .default-content-wrapper > p').forEach((p) => {
    const next = p.nextElementSibling;
    if (isLabel(p) && next && next.matches(HEADINGS)) {
      p.classList.add('eyebrow');
    } else if (isLabel(p) && !next && isBlockWrapper(p.parentElement.nextElementSibling)) {
      p.classList.add('block-heading');
    } else if (isMediaParagraph(p)) {
      p.classList.add('media');
      const em = next && next.tagName === 'P' && next.children.length === 1 && next.querySelector(':scope > em');
      if (em && em.textContent.trim() === next.textContent.trim()) next.classList.add('caption');
    }
  });
}

/**
 * Unformatted link-only paragraphs closing a column read as the source's CTA row: the first
 * one is the outlined button, any after it the text-link CTA (chevron). Authored (bold/italic)
 * buttons are left as decorateButtons made them.
 * @param {Element} column The column container
 */
function decorateTrailingCtas(column) {
  const last = column.lastElementChild;
  if (!isWrapper(last)) return;
  const kids = [...last.children];
  let first = kids.length;
  while (first > 0 && isLinkParagraph(kids[first - 1])) first -= 1;
  kids.slice(first).forEach((p, i) => {
    const a = p.querySelector('a');
    if (a.classList.contains('button')) return;
    p.className = 'button-wrapper';
    a.className = `button ${i === 0 ? 'primary' : 'link'}`;
    a.title = a.title || a.textContent;
  });
  column.querySelectorAll('a.button').forEach((a) => {
    if (isExternal(a)) a.classList.add('external');
  });
}

/**
 * `split` / `sky-split` / `sky-split-inset`: eyebrow + heading (+ the media right after it)
 * form the start column, everything after it the end column.
 * @param {Element} section The section element
 */
function decorateSplitSection(section) {
  const wrappers = [...section.children];
  const headingWrapper = wrappers.find((w) => isWrapper(w) && w.querySelector(`:scope > :is(${HEADINGS})`));
  if (!headingWrapper) return;
  const idx = wrappers.indexOf(headingWrapper);
  const kids = [...headingWrapper.children];
  let cut = kids.indexOf(headingWrapper.querySelector(`:scope > :is(${HEADINGS})`)) + 1;
  while (cut < kids.length && isMediaParagraph(kids[cut])) cut += 1;

  const start = newWrapper('split-start', wrappers.slice(0, idx + 1));
  const rest = wrappers.slice(idx + 1);
  if (cut < kids.length) {
    rest.unshift(newWrapper('default-content-wrapper', kids.slice(cut)));
  } else if (rest[0] && rest[0].querySelector(':scope > .video, :scope > .embed')) {
    start.append(rest.shift());
  }
  const end = newWrapper('split-end', rest);
  section.append(start, end);
  decorateTrailingCtas(end);
}

/**
 * `sidebar`: the closing default-content group (or a short label + the block after it) moves
 * into the aside; the rest is the main column. Main columns carrying wide media (an image
 * paragraph or a quote) get the wider article measure.
 * @param {Element} section The section element
 */
function decorateSidebarSection(section) {
  const wrappers = [...section.children];
  if (wrappers.length < 2) return;
  let asideCount = 0;
  const last = wrappers[wrappers.length - 1];
  const prev = wrappers[wrappers.length - 2];
  if (isWrapper(last)) {
    asideCount = 1;
  } else if (isWrapper(prev) && prev.children.length === 1 && isLabel(prev.firstElementChild)
    && wrappers.length > 2) {
    asideCount = 2;
  }
  if (!asideCount) return;
  const main = newWrapper('sidebar-main', wrappers.slice(0, -asideCount));
  const aside = newWrapper('sidebar-aside', wrappers.slice(-asideCount));
  const label = aside.querySelector(':scope > .default-content-wrapper:first-child > p:first-child');
  if (isLabel(label)) {
    label.classList.remove('block-heading');
    label.classList.add('eyebrow');
  }
  aside.querySelectorAll(':scope .default-content-wrapper > p').forEach((p) => {
    const text = p.textContent.trim();
    const next = p.nextElementSibling;
    if (isLabel(p) && !p.children.length && text === text.toUpperCase() && next && next.matches('ul, ol')) {
      p.classList.add('eyebrow-mini');
    } else if (isLinkParagraph(p) && !p.querySelector('a.button')) {
      const a = p.querySelector('a');
      a.classList.add('link-cta');
      if (isExternal(a)) a.classList.add('external');
    }
  });
  if (main.querySelector('.media, .quote')) section.classList.add('sidebar-article');
  section.append(main, aside);
}

/**
 * Layout decoration for section styles that need column containers. Runs after
 * decorateBlocks: blocks are found by `.block` anywhere in the section, so nesting wrappers
 * one level deeper keeps block loading intact.
 * @param {Element} main The main element
 */
function decorateSectionLayouts(main) {
  main.querySelectorAll(':scope > .section').forEach((section) => {
    try {
      decorateDefaultContentRoles(section);
      if (section.matches('.split, .sky-split, .sky-split-inset')) decorateSplitSection(section);
      else if (section.matches('.sidebar')) decorateSidebarSection(section);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Section layout decoration failed', error);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSectionMetadata(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateSectionLayouts(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // site-wide widgets (external-link departure warning)
  import('./delayed.js');
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
