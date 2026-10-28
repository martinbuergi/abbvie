/* eslint-disable */
/* global WebImporter */

/**
 * AbbVie sections transformer (shared by all templates).
 *
 * beforeTransform: walks template.sections in reverse and inserts an <hr>
 * before every non-first section element (while parser targets still exist).
 * Every inserted <hr> carries a temporary data-excat-section-id marker so the
 * afterTransform pass can locate section boundaries in document order. A
 * styled first section gets a temporary marked <hr> too (removed later).
 *
 * afterTransform: for each styled section, inserts a Section Metadata block
 * (single "style" row) at the END of the section, i.e. right before the next
 * section's <hr> marker in document order, or at the end of the root element
 * for the last section. Placing it at the section end keeps content that
 * follows the matched element (e.g. the story-card grid right after the
 * "Related Content" title section) inside the same section, ahead of the
 * metadata. No <hr> is ever inserted before such following siblings because
 * only elements matched by template.sections selectors receive breaks.
 */

const MARKER = 'data-excat-section-id';
const FIRST_MARKER = 'data-excat-section-first'; // temp <hr> before a styled first section

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector for this DOM engine; try the next one
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      if (i === 0) {
        if (section.style) {
          const hr = doc.createElement('hr');
          hr.setAttribute(MARKER, section.id);
          hr.setAttribute(FIRST_MARKER, 'true');
          el.before(hr);
        }
        continue;
      }
      // Avoid duplicate breaks if an <hr> already precedes the element.
      const prev = el.previousElementSibling;
      if (prev && prev.tagName === 'HR' && prev.hasAttribute(MARKER)) continue;
      const hr = doc.createElement('hr');
      hr.setAttribute(MARKER, section.id);
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    const markers = [...element.querySelectorAll(`hr[${MARKER}]`)];
    const markerById = new Map(markers.map((hr) => [hr.getAttribute(MARKER), hr]));

    // Walk sections in reverse; insert metadata before the next marker.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const ownMarker = markerById.get(section.id);
      // A section whose element was never found has no marker (non-first).
      if (!ownMarker && i !== 0) continue;
      if (i === 0 && !ownMarker) continue;

      const ownIdx = markers.indexOf(ownMarker);
      const nextMarker = ownIdx >= 0 ? markers[ownIdx + 1] : null;

      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      if (nextMarker) {
        nextMarker.before(metadata);
      } else {
        // Last section: append at the end of <main> (or the root) so any
        // trailing siblings (e.g. story-card grid after "Related Content")
        // stay in this section.
        const container = (element.tagName === 'MAIN' ? element : element.querySelector('main')) || element;
        container.append(metadata);
      }
    }

    // Remove temporary markers; drop the first-section placeholder <hr>.
    markers.forEach((hr) => {
      if (hr.hasAttribute(FIRST_MARKER)) {
        hr.remove();
      } else {
        hr.removeAttribute(MARKER);
      }
    });
  }
}
