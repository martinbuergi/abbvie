/* eslint-disable */
/* global WebImporter */

/**
 * AbbVie links transformer (afterTransform only, shared by all templates).
 *
 * Site convention (see content/who-we-are/brand-partnerships/pga-tour):
 * links that are relative on the source page are authored as absolute
 * https://www.abbvie.com/... URLs. Without this transformer the importer
 * would keep them relative.
 *
 * - root-relative ("/x.html") and document-relative ("x.html", "../x.html")
 *   hrefs are resolved against the page URL and rewritten to the
 *   https://www.abbvie.com origin;
 * - protocol-relative ("//host/x") hrefs get an https: scheme;
 * - in-page anchors (#...), mailto:, tel:, javascript: and already absolute
 *   URLs are left untouched;
 * - link text equal to the old relative href is updated too.
 */

const ORIGIN = 'https://www.abbvie.com';
const SKIP = /^(#|mailto:|tel:|javascript:|data:|https?:\/\/)/i;

function resolveHref(href, pageUrl) {
  const raw = href.trim();
  if (!raw || SKIP.test(raw)) return null;
  if (raw.startsWith('//')) return `https:${raw}`;
  let base = ORIGIN;
  try {
    const u = new URL(pageUrl);
    // Local proxy / localhost runs: keep the path, swap to the site origin.
    base = `${ORIGIN}${u.pathname}`;
  } catch (e) {
    // fall back to origin
  }
  try {
    const resolved = new URL(raw, base);
    return `${ORIGIN}${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch (e) {
    return null;
  }
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const pageUrl = (payload && payload.params && payload.params.originalURL) || (payload && payload.url) || ORIGIN;

  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const abs = resolveHref(href, pageUrl);
    if (!abs) return;
    a.setAttribute('href', abs);
    if (a.textContent.trim() === href.trim()) a.textContent = abs;
  });
}
