/* eslint-disable */
/* global WebImporter */

/**
 * AbbVie Dynamic Media transformer (afterTransform only).
 *
 * AbbVie serves some images from AEM Dynamic Media Open API
 * (https://delivery-pXXXX-eXXXX.adobeaemcloud.com/adobe/assets/urn:...).
 * Each DM <img> stays an image: its src becomes the clean asset URL with one
 * width=1200 rendition, and responsive <source>/srcset are dropped.
 */

function detectDynamicMediaUrl(urlStr) {
  if (!urlStr || !/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch (e) { return false; }
  if (u.pathname.startsWith('/is/image/')) return 'scene7';
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

// Rendition params the runtime auto-block re-applies per breakpoint; strip
// them so the authored URL is the clean asset URL. Other params are kept.
const DM_OPENAPI_RENDITION_PARAMS = ['width', 'height', 'max-quality', 'quality', 'auto-format', 'format', 'optimize'];

function normalizeUrl(src) {
  const abs = src.startsWith('//') ? `https:${src}` : src;
  if (detectDynamicMediaUrl(abs) !== 'dm-openapi') return abs;
  try {
    const u = new URL(abs);
    DM_OPENAPI_RENDITION_PARAMS.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch (e) {
    return abs;
  }
}

function pickDmSrc(img) {
  const candidates = [img.getAttribute('src'), img.getAttribute('data-src')];
  const picture = img.closest('picture');
  if (picture) {
    picture.querySelectorAll('source').forEach((s) => {
      const srcset = s.getAttribute('srcset') || '';
      const first = srcset.split(',')[0].trim().split(/\s+/)[0];
      if (first) candidates.push(first);
    });
  }
  const srcset = img.getAttribute('srcset') || '';
  if (srcset) candidates.push(srcset.split(',')[0].trim().split(/\s+/)[0]);
  return candidates.find((c) => c && detectDynamicMediaUrl(c.trim())) || null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  // Keep DM images as real <img> elements (the project does not install the DM
  // auto-block / aem.js dispatcher, and the existing pages author pictures as images).
  // The authored src is the clean asset URL plus one fixed rendition, so it renders
  // directly in preview and is ingested as a regular image on upload.
  [...element.querySelectorAll('img')].forEach((img) => {
    if (!img.isConnected) return;
    const dmSrc = pickDmSrc(img);
    if (!dmSrc) return;
    const u = new URL(normalizeUrl(dmSrc.trim()));
    u.searchParams.set('width', '1200');
    img.setAttribute('src', u.toString());
    img.removeAttribute('srcset');
    img.removeAttribute('data-src');
    const picture = img.closest('picture');
    if (picture) picture.querySelectorAll('source').forEach((el) => el.remove());
  });
}
