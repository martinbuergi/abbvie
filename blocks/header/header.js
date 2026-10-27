import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Header — template-slotted replica of the abbvie.com header.
 * Authored /nav contract (one section per role):
 *   1. brand   — the logo link (picture inside an <a>)
 *   2. links   — <ul> of the main sections (<a> per item; an optional nested <ul> fills the panel)
 *   3. tools   — <ul>: MORE (nested groups), GLOBAL (nested groups), search (<a> = form action,
 *                nested <ul>: mobile placeholder, validation alert)
 *   4. mobile  — <ul> of the mobile-only labels for the MORE / GLOBAL copies (Quick Links, GLOBAL)
 * Behaviour (observed on the source, stardust/replica/motion): click-to-open dropdown panels
 * with a scaleY/opacity transition, CLOSE / Escape / outside-click close, hide-nav while
 * scrolling down and show-nav while scrolling up, hamburger menu below 1024px.
 */

const isDesktop = window.matchMedia('(width >= 1024px)');

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

/** The label of a list item: its own text (direct text nodes or a leading <p>). */
function ownLabel(li) {
  const p = li.querySelector(':scope > p');
  if (p) return p.textContent.trim();
  return [...li.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join('')
    .trim();
}

/** [{ label, links: [<a>] }] from an authored nested list. */
function readGroups(ul) {
  if (!ul) return [];
  return [...ul.querySelectorAll(':scope > li')].map((li) => ({
    label: ownLabel(li),
    links: [...li.querySelectorAll(':scope > ul > li a')],
  }));
}

function slugOf(a) {
  try {
    const seg = new URL(a.href, window.location).pathname.split('/').filter(Boolean)[0] || '';
    return seg.replace(/\.html$/, '');
  } catch {
    return '';
  }
}

function panelShell() {
  const panel = el('div', 'nav-panel');
  const row = el('div', 'nav-panel-close-row');
  row.append(el('button', 'nav-panel-close', { type: 'button' }));
  row.firstElementChild.textContent = 'CLOSE';
  panel.append(row);
  return panel;
}

function markExternal(a) {
  try {
    const url = new URL(a.href, window.location);
    if (url.hostname !== window.location.hostname && url.hostname !== 'www.abbvie.com') {
      a.classList.add('is-external');
    }
  } catch { /* ignore */ }
}

function linkList(links, keepNodes) {
  const ul = el('ul');
  links.forEach((a) => {
    const li = el('li');
    const link = keepNodes ? a : a.cloneNode(true);
    link.removeAttribute('data-prose-index');
    markExternal(link);
    li.append(link);
    ul.append(li);
  });
  return ul;
}

/** Desktop accordion body (MORE / GLOBAL): labels left, the open group's links right. */
function accBody(groups) {
  const body = el('div', 'nav-panel-body nav-acc');
  const list = el('ul', 'nav-acc-groups');
  groups.forEach((g, i) => {
    const item = el('li', `nav-acc-item${i === 0 ? ' is-open' : ''}`);
    const label = el('span', 'nav-acc-label', { role: 'button', tabindex: '0' });
    label.textContent = g.label;
    const links = el('div', `nav-acc-links${g.links.length > 20 ? ' nav-acc-links-two' : ''}`);
    links.append(linkList(g.links, true));
    item.append(label, links);
    const open = () => {
      list.querySelectorAll('.nav-acc-item').forEach((o) => o.classList.toggle('is-open', o === item));
    };
    label.addEventListener('click', open);
    label.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
    list.append(item);
  });
  body.append(list);
  return body;
}

/** Mobile groups body (Quick Links / GLOBAL copies): every group open, label above links. */
function groupsBody(groups) {
  const body = el('div', 'nav-panel-body');
  const list = el('ul', 'nav-groups');
  groups.forEach((g) => {
    const item = el('li', 'nav-group');
    const label = el('p', 'nav-group-label');
    label.textContent = g.label;
    item.append(label, linkList(g.links, false));
    list.append(item);
  });
  body.append(list);
  return body;
}

function iconSpan(source) {
  const icon = source && source.querySelector('.icon');
  const wrap = el('span', 'nav-tool-icon');
  if (icon) {
    const img = icon.querySelector('img');
    if (img) {
      img.alt = '';
      img.loading = 'eager';
      wrap.append(img);
    }
  }
  return wrap;
}

function buildSearch(li) {
  const action = li.querySelector('a');
  const extra = [...li.querySelectorAll(':scope > ul > li')].map((x) => x.textContent.trim());
  const deskText = action ? action.textContent.trim() : 'Search';
  const mobileText = extra[0] || deskText;
  const alertText = extra[1] || '';
  const wrap = el('div', 'nav-search');
  const form = el('form', 'nav-search-form', {
    method: 'get',
    action: action ? action.href : '/search-results',
    role: 'search',
  });
  const field = el('div', 'nav-search-field');
  const input = el('input', 'nav-search-input', {
    type: 'search',
    autocomplete: 'off',
    spellcheck: 'false',
    maxlength: '100',
    name: 'q',
    id: 'site-search',
    'aria-label': 'Search',
    'aria-describedby': 'site-search-alert',
  });
  const label = el('label', 'nav-search-label', { for: 'site-search', 'aria-label': 'Search' });
  const alert = el('div', 'nav-search-alert', { id: 'site-search-alert' });
  const alertP = el('p');
  alertP.textContent = alertText;
  alert.append(alertP);
  field.append(input, label, alert);
  form.append(field);
  wrap.append(form);
  const sync = () => {
    const text = isDesktop.matches ? deskText : mobileText;
    input.setAttribute('aria-label', text);
    label.textContent = text;
  };
  sync();
  isDesktop.addEventListener('change', sync);
  input.addEventListener('input', () => {
    label.hidden = input.value.length > 0;
    form.classList.remove('is-invalid');
  });
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) {
      e.preventDefault();
      form.classList.add('is-invalid');
    }
  });
  return wrap;
}

function wireDropdowns(root, nav) {
  const items = [...root.querySelectorAll('.nav-section, .nav-tool')];
  const closeAll = (except) => items.forEach((li) => {
    if (li === except) return;
    li.setAttribute('aria-expanded', 'false');
    const b = li.querySelector(':scope > button');
    if (b) b.setAttribute('aria-expanded', 'false');
  });
  const syncSub = () => {
    const open = root.querySelector('.nav-section[aria-expanded="true"]');
    nav.classList.toggle('is-sub', !isDesktop.matches && !!open);
  };
  items.forEach((li) => {
    const btn = li.querySelector(':scope > button');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = li.getAttribute('aria-expanded') !== 'true';
      closeAll(li);
      li.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-expanded', String(open));
      syncSub();
      if (open && li.classList.contains('nav-tool-search')) {
        const input = li.querySelector('.nav-search-input');
        if (input) setTimeout(() => input.focus(), 400);
      }
    });
    li.querySelectorAll('.nav-panel-close').forEach((c) => c.addEventListener('click', () => {
      closeAll();
      syncSub();
    }));
  });
  const back = root.querySelector('.nav-back-btn');
  if (back) {
    back.addEventListener('click', () => {
      closeAll();
      syncSub();
    });
  }

  const hamburger = root.querySelector('.site-nav-hamburger button');
  const setMenu = (expanded) => {
    nav.setAttribute('aria-expanded', String(expanded));
    hamburger.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
    if (!expanded) {
      closeAll();
      syncSub();
    }
  };
  hamburger.addEventListener('click', () => {
    setMenu(nav.getAttribute('aria-expanded') !== 'true');
  });
  isDesktop.addEventListener('change', () => setMenu(false));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAll();
    syncSub();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('header')) {
      closeAll();
      syncSub();
    }
  });
}

function wireScroll(siteHeader) {
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > siteHeader.offsetHeight) {
      siteHeader.classList.add('hide-nav');
      siteHeader.classList.remove('show-nav');
    } else if (y < lastY) {
      siteHeader.classList.add('show-nav');
      siteHeader.classList.remove('hide-nav');
    }
    lastY = y;
  }, { passive: true });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [brandSec, linksSec, toolsSec, mobileSec] = sections;

  const siteHeader = el('div', 'site-header');
  const bar = el('div', 'site-nav-bar');
  const nav = el('nav', 'site-nav', { id: 'nav', 'aria-expanded': 'false' });

  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main-content';
  const skip = el('a', 'skip-link', { href: '#main-content' });
  skip.textContent = 'Skip to main content';

  // 1. brand
  const brand = el('div', 'site-nav-brand');
  if (brandSec) {
    const link = brandSec.querySelector('a');
    const pic = brandSec.querySelector('picture, img');
    if (link && pic && !link.contains(pic)) link.append(pic);
    const img = brandSec.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.width = 110;
      img.height = 20;
    }
    if (link) brand.append(link);
    else if (pic) brand.append(pic);
  }

  // 2. sections (+ the mobile-only copies of MORE / GLOBAL)
  const sectionsWrap = el('div', 'site-nav-sections');
  const sectionsList = el('ul');
  const backLi = el('li', 'nav-back');
  const backBtn = el('button', 'nav-back-btn', { type: 'button' });
  backBtn.textContent = 'BACK';
  backLi.append(backBtn);
  sectionsList.append(backLi);
  const here = window.location.pathname.split('/').filter(Boolean)[0] || '';
  const linksUl = linksSec && linksSec.querySelector('ul');
  if (linksUl) {
    [...linksUl.querySelectorAll(':scope > li')].forEach((src) => {
      const a = src.querySelector('a');
      const li = el('li', 'nav-section');
      const slug = a ? slugOf(a) : '';
      const btn = el('button', 'nav-section-btn', {
        type: 'button',
        'aria-label': slug || ownLabel(src).toLowerCase(),
        'aria-expanded': 'false',
      });
      if (slug && slug === here) btn.classList.add('is-current');
      const span = el('span');
      if (a) span.append(...a.childNodes);
      else span.textContent = ownLabel(src);
      btn.append(span);
      const panel = panelShell();
      const sub = src.querySelector(':scope > ul');
      if (sub) panel.append(groupsBody(readGroups(sub)));
      li.append(btn, panel);
      sectionsList.append(li);
    });
  }

  // 3. tools
  const toolsWrap = el('div', 'site-nav-tools');
  const toolsList = el('ul');
  const toolsUl = toolsSec && toolsSec.querySelector('ul');
  const toolItems = toolsUl ? [...toolsUl.querySelectorAll(':scope > li')] : [];
  const mobileLabels = mobileSec
    ? [...mobileSec.querySelectorAll('ul > li')].map((li) => li.textContent.trim())
    : [];
  let mobileIndex = 0;
  toolItems.forEach((src) => {
    const icon = src.querySelector('.icon');
    const iconName = icon ? [...icon.classList].find((c) => c.startsWith('icon-')) : '';
    const isSearch = iconName === 'icon-search';
    const label = isSearch ? '' : ownLabel(src);
    const slug = isSearch ? 'search' : label.toLowerCase();
    const li = el('li', `nav-tool${isSearch ? ' nav-tool-search' : ''}`);
    const btn = el('button', 'nav-tool-btn', {
      type: 'button',
      'aria-label': slug,
      'aria-expanded': 'false',
    });
    const iconWrap = iconSpan(src);
    const labelSpan = el('span', 'nav-tool-label');
    labelSpan.textContent = label;
    btn.append(iconWrap, labelSpan);
    const panel = panelShell();
    if (isSearch) {
      panel.append(buildSearch(src));
    } else {
      const groups = readGroups(src.querySelector(':scope > ul'));
      // mobile copy (Quick Links / GLOBAL) lives in the sections list, before the tools move
      const mLi = el('li', 'nav-section nav-section-mobile');
      const mLabel = mobileLabels[mobileIndex] || label;
      mobileIndex += 1;
      const mBtn = el('button', 'nav-section-btn', {
        type: 'button',
        'aria-label': mLabel.toLowerCase().replace(/\s+/g, '-'),
        'aria-expanded': 'false',
      });
      if (slug === 'global') {
        const gIcon = el('span', 'nav-tool-icon');
        const img = iconWrap.querySelector('img');
        if (img) gIcon.append(img.cloneNode(true));
        mBtn.append(gIcon);
      }
      const mSpan = el('span');
      mSpan.textContent = mLabel;
      mBtn.append(mSpan);
      const mPanel = panelShell();
      mPanel.append(groupsBody(groups));
      mLi.append(mBtn, mPanel);
      sectionsList.append(mLi);
      panel.append(accBody(groups));
    }
    li.append(btn, panel);
    toolsList.append(li);
  });
  sectionsWrap.append(sectionsList);
  toolsWrap.append(toolsList);

  // hamburger
  const hamburgerWrap = el('div', 'site-nav-hamburger');
  const hamburger = el('button', '', { type: 'button', 'aria-label': 'Open navigation' });
  hamburger.append(el('span'), el('span'), el('span'));
  hamburgerWrap.append(hamburger);

  nav.append(skip, brand, sectionsWrap, toolsWrap, hamburgerWrap);
  bar.append(nav);
  siteHeader.append(bar);
  block.replaceChildren(siteHeader);

  wireDropdowns(siteHeader, nav);
  wireScroll(siteHeader);
}
