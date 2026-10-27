import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Footer — template-slotted replica of the abbvie.com footer.
 * Authored /footer contract (one section per column, then the legal row):
 *   1. logo         — picture
 *   2. primary      — <ul> of the large section links, then <ul> of social links (:icon: per link)
 *   3. popular      — eyebrow <p>, <ul> of links
 *   4. external     — eyebrow <p>, <ul> of links, then the legal copy paragraphs
 *   5. legal        — <ul> of the legal links (an :icon: after a link is kept beside it)
 * Social and external-column links carry the departure warning (scripts/delayed.js).
 */

const NEW_WINDOW = ', external link, opens in a new window';

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function isOffsite(a) {
  try {
    const { hostname } = new URL(a.href, window.location);
    return hostname !== window.location.hostname && hostname !== 'www.abbvie.com';
  } catch {
    return false;
  }
}

function srOnly() {
  const s = el('span', 'sr-only');
  s.textContent = NEW_WINDOW;
  return s;
}

/** Wrap a link's authored text nodes in a span (nodes are moved, never rebuilt). */
function wrapText(a, className) {
  const span = el('span', className);
  span.append(...a.childNodes);
  a.append(span);
  return span;
}

function newWindow(a) {
  a.target = '_blank';
  a.rel = 'noopener';
}

function navWrap(ul, label) {
  const nav = el('nav', '', { 'aria-label': label });
  nav.append(ul);
  return nav;
}

function eyebrow(p) {
  const wrap = el('div', 'eyebrow');
  const span = el('span');
  span.append(...p.childNodes);
  wrap.append(span);
  p.remove();
  return wrap;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;
  const [logoSec, primarySec, popularSec, externalSec, legalSec] = [
    ...fragment.querySelectorAll(':scope > .section'),
  ];

  const root = el('div', 'site-footer');
  const inner = el('div', 'site-footer-inner');
  const top = el('button', 'back-to-top', { type: 'button', 'aria-label': 'Back to top' });
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const main = el('div', 'footer-main');
  const grid = el('div', 'grid');

  // 1. logo
  const col1 = el('div', 'span-2');
  const logo = el('p', 'footer-logo');
  const pic = logoSec && logoSec.querySelector('picture, img');
  if (pic) logo.append(pic);
  col1.append(logo);

  // 2. primary + social
  const col2 = el('div', 'span-4');
  const [primaryUl, socialUl] = primarySec ? [...primarySec.querySelectorAll('ul')] : [];
  if (primaryUl) {
    primaryUl.className = 'footer-primary';
    primaryUl.querySelectorAll('a').forEach((a) => wrapText(a));
    col2.append(navWrap(primaryUl, 'Links'));
  }
  if (socialUl) {
    socialUl.className = 'footer-social';
    socialUl.querySelectorAll('a').forEach((a) => {
      const icon = el('span', 'footer-social-icon');
      const authored = a.querySelector('.icon');
      if (authored) icon.append(...authored.childNodes);
      icon.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      const text = wrapText(a, 'footer-social-text');
      if (authored) authored.remove();
      a.prepend(icon);
      text.after(srOnly());
      newWindow(a);
      a.dataset.warnDeparture = '';
    });
    col2.append(navWrap(socialUl, 'Links'));
  }

  // 3. popular pages
  const col3 = el('div', 'span-2');
  if (popularSec) {
    const p = popularSec.querySelector('p');
    if (p) col3.append(eyebrow(p));
    const ul = popularSec.querySelector('ul');
    if (ul) {
      ul.className = 'footer-links';
      ul.querySelectorAll('a').forEach((a) => wrapText(a, 'footer-links-text'));
      col3.append(navWrap(ul, 'single-column'));
    }
  }

  // 4. external links + legal copy
  const col4 = el('div', 'span-4');
  if (externalSec) {
    const ul = externalSec.querySelector('ul');
    const prev = ul && ul.previousElementSibling;
    const head = prev && prev.tagName === 'P' ? prev : null;
    const paras = [...externalSec.querySelectorAll('p')].filter((p) => p !== head);
    if (head) col4.append(eyebrow(head));
    if (ul) {
      ul.className = 'footer-links';
      ul.querySelectorAll('a').forEach((a) => {
        const text = wrapText(a, 'footer-links-text');
        const ext = el('span', 'footer-links-ext', { 'aria-hidden': 'true' });
        text.after(ext, srOnly());
        newWindow(a);
        a.dataset.warnDeparture = '';
      });
      col4.append(navWrap(ul, 'Links'));
    }
    col4.append(el('div', 'footer-gap', { 'aria-hidden': 'true' }));
    paras.forEach((p, i) => {
      const copy = el('div', 'footer-legal-copy');
      if (i > 0 && i === paras.length - 1) copy.classList.add('footer-legal-copy-right');
      copy.append(p);
      col4.append(copy);
    });
  }

  grid.append(col1, col2, col3, col4);
  main.append(grid);

  // 5. legal row
  const legal = el('div', 'footer-legal');
  legal.append(
    el('div', 'footer-legal-rule', { 'aria-hidden': 'true' }),
    el('div', 'footer-legal-gap', { 'aria-hidden': 'true' }),
  );
  const legalUl = legalSec && legalSec.querySelector('ul');
  if (legalUl) {
    legalUl.className = 'footer-legal-list';
    legalUl.querySelectorAll(':scope > li').forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      const icon = li.querySelector(':scope > .icon');
      const text = wrapText(a, 'footer-legal-text');
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        // Cookies Settings: a button-like control (consent manager scaffolded off)
        a.classList.add('cookie-settings');
        a.setAttribute('role', 'button');
        a.removeAttribute('href');
        a.tabIndex = 0;
        a.replaceChildren(...text.childNodes);
        return;
      }
      if (isOffsite(a) || /privacy/i.test(href)) newWindow(a);
      if (isOffsite(a)) text.after(srOnly());
      if (icon) {
        li.classList.add('footer-legal-item-icon');
        const wrap = el('span', 'footer-legal-icon');
        wrap.append(...icon.childNodes);
        wrap.querySelectorAll('img').forEach((img) => { img.alt = ''; });
        icon.replaceWith(wrap);
      }
      [...li.childNodes].forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
      });
    });
    legal.append(navWrap(legalUl, 'Links'));
  }

  inner.append(top, main, legal);
  root.append(inner);
  block.replaceChildren(root);
}
