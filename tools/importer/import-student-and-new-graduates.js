/* eslint-disable */
/* global WebImporter */

// Import script for template: student-and-new-graduates
// Parsers
import heroParser from './parsers/hero.js';
import mediaCopyParser from './parsers/media-copy.js';
import videoParser from './parsers/video.js';
import cardsIconFeaturesParser from './parsers/cards-icon-features.js';
import accordionPlusParser from './parsers/accordion-plus.js';
import columnsPhotoBgParser from './parsers/columns-photo-bg.js';

// Transformers
import abbvieCleanupTransformer from './transformers/abbvie-cleanup.js';
import abbvieSectionsTransformer from './transformers/abbvie-sections.js';
import abbvieDmImagesTransformer from './transformers/abbvie-dm-images.js';
import abbvieLinksTransformer from './transformers/abbvie-links.js';

const PAGE_TEMPLATE = {
  "name": "student-and-new-graduates",
  "urls": [
    "https://www.abbvie.com/join-us/student-and-new-graduates/new-graduates-and-entry-level-positions.html"
  ],
  "representativeUrl": "https://www.abbvie.com/join-us/student-and-new-graduates/new-graduates-and-entry-level-positions.html",
  "description": "To be named in naming step",
  "blocks": [
    {
      "name": "hero",
      "instances": [
        ".hero-container-wrapper > .hero-container.block"
      ]
    },
    {
      "name": "media-copy",
      "instances": [
        ".inner-grid.cols-5-1-6.section-bottom-margin:not(.bg-f1f3ff):has(> .inner-grid-container > .inner-grid-col.span-5 .custom-image)"
      ]
    },
    {
      "name": "video",
      "instances": [
        ".brightcove-video-wrapper > .brightcove-video.block"
      ]
    },
    {
      "name": "cards-icon-features",
      "instances": [
        ".text-container-wrapper + .inner-grid-wrapper > .inner-grid.cols-6-6"
      ]
    },
    {
      "name": "accordion-plus",
      "instances": [
        ".accordion-wrapper > .accordion.block"
      ]
    },
    {
      "name": "columns-photo-bg",
      "instances": [
        "#section-bg-6 > .inner-grid-wrapper > .inner-grid.cols-4-8.first-col-bg-white"
      ]
    }
  ],
  "urlPattern": "/join-us/student-and-new-graduates/*",
  "sections": [
    {
      "id": "s1",
      "name": "Hero",
      "selector": [
        "#main-content > .section.hero-container-container",
        "main > div.section:has(> .hero-container-wrapper)"
      ],
      "style": null,
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "s2",
      "name": "Recruitment timeline / Shape what's next",
      "selector": [
        "#main-content > .section.brightcove-video-container > .inner-grid-wrapper:has(> .inner-grid.cols-5-1-6:not(.bg-f1f3ff))",
        "#main-content > .section.brightcove-video-container > .inner-grid-wrapper:first-of-type"
      ],
      "style": null,
      "blocks": [
        "media-copy"
      ],
      "defaultContent": []
    },
    {
      "id": "s3",
      "name": "Development Programs",
      "selector": [
        "#main-content > .section.brightcove-video-container > .inner-grid-wrapper:has(> .inner-grid.cols-5-1-6.bg-f1f3ff)",
        "#main-content > .section > .inner-grid-wrapper:has(.brightcove-video)"
      ],
      "style": "sky-split-inset",
      "blocks": [
        "video",
        "cards-icon-features",
        "accordion-plus"
      ],
      "defaultContent": [
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .eyebrow-text-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .custom-title-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-6 > .text-container-wrapper",
        ".accordion-block-heading",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-6 > .cta-wrapper"
      ]
    },
    {
      "id": "s4",
      "name": "Postdoctoral Program",
      "selector": [
        "#main-content > .section.accordion-container.cta-container.separator-container:not(.brightcove-video-container)",
        "#main-content > .section:has(> .inner-grid-wrapper > .inner-grid.cols-5-1-6.bg-ffffff)"
      ],
      "style": "split",
      "blocks": [
        "cards-icon-features",
        "accordion-plus"
      ],
      "defaultContent": [
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .eyebrow-text-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .custom-title-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .custom-image-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-6 > .text-container-wrapper",
        ".accordion-block-heading",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-6 > .cta-wrapper"
      ]
    },
    {
      "id": "s5",
      "name": "Fellowships",
      "selector": [
        "#main-content > .section.bg-f1f3ff.accordion-container"
      ],
      "style": "sky-split",
      "blocks": [
        "cards-icon-features",
        "accordion-plus"
      ],
      "defaultContent": [
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .eyebrow-text-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .custom-title-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .custom-image-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-6 > .text-container-wrapper",
        ".accordion-block-heading"
      ]
    },
    {
      "id": "s6",
      "name": "Entry-level opportunities",
      "selector": [
        "#main-content > .section.accordion-container.cta-container:not(.separator-container):not(.bg-f1f3ff)"
      ],
      "style": "split",
      "blocks": [
        "accordion-plus"
      ],
      "defaultContent": [
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .eyebrow-text-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .custom-title-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-5 > .custom-image-wrapper",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-6 > .text-container-wrapper",
        ".accordion-block-heading",
        ".inner-grid.cols-5-1-6 > .inner-grid-container > .inner-grid-col.span-6 > .cta-wrapper"
      ]
    },
    {
      "id": "s7",
      "name": "Frequently asked questions",
      "selector": [
        "#main-content > .section.section-padding.accordion-container",
        "#main-content > .section:has(> .inner-grid-wrapper > .inner-grid.cols-3-6-3)"
      ],
      "style": "narrow",
      "blocks": [
        "accordion-plus"
      ],
      "defaultContent": [
        ".inner-grid.cols-3-6-3 > .inner-grid-container > .inner-grid-col.span-6 > .custom-title-wrapper"
      ]
    },
    {
      "id": "s8",
      "name": "Stay in touch / Join us",
      "selector": [
        "#section-bg-6",
        "#main-content > .section.dashboard-card-link-list-container"
      ],
      "style": null,
      "blocks": [
        "columns-photo-bg"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero': heroParser,
  'media-copy': mediaCopyParser,
  'video': videoParser,
  'cards-icon-features': cardsIconFeaturesParser,
  'accordion-plus': accordionPlusParser,
  'columns-photo-bg': columnsPhotoBgParser,
};

const transformers = [
  abbvieCleanupTransformer,
  abbvieSectionsTransformer,
  abbvieDmImagesTransformer,
  abbvieLinksTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try {
      fn(hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try {
        parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
      }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
