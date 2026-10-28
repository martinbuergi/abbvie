/* eslint-disable */
/* global WebImporter */

// Import script for template: our-stories
// Parsers
import heroParser from './parsers/hero.js';
import cardsChecklistParser from './parsers/cards-checklist.js';
import quoteParser from './parsers/quote.js';
import accordionPlusParser from './parsers/accordion-plus.js';
import storyCardsParser from './parsers/story-cards.js';

// Transformers
import abbvieCleanupTransformer from './transformers/abbvie-cleanup.js';
import abbvieSectionsTransformer from './transformers/abbvie-sections.js';
import abbvieDmImagesTransformer from './transformers/abbvie-dm-images.js';
import abbvieLinksTransformer from './transformers/abbvie-links.js';

const PAGE_TEMPLATE = {
  "name": "our-stories",
  "urls": [
    "https://www.abbvie.com/who-we-are/our-stories/the-next-frontier-of-psychedelic-science.html"
  ],
  "representativeUrl": "https://www.abbvie.com/who-we-are/our-stories/the-next-frontier-of-psychedelic-science.html",
  "description": "To be named in naming step",
  "blocks": [
    {
      "name": "hero",
      "instances": [
        ".hero-container-wrapper > .hero-container.block"
      ]
    },
    {
      "name": "cards-checklist",
      "instances": [
        ".separator-wrapper + .inner-grid-wrapper > .inner-grid.cols-1-10-1"
      ]
    },
    {
      "name": "quote",
      "instances": [
        ".quote-wrapper > .quote.block"
      ]
    },
    {
      "name": "accordion-plus",
      "instances": [
        ".accordion-wrapper > .accordion.block"
      ]
    },
    {
      "name": "story-cards",
      "instances": [
        ".grid-section.grid-cols-2.story-card-container > .story-card-wrapper",
        ".grid-container-inner:has(> .grid-section.grid-cols-6.story-card-container)"
      ]
    }
  ],
  "urlPattern": "/who-we-are/our-stories/*",
  "sections": [
    {
      "id": "s1",
      "name": "Story hero",
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
      "name": "Key Takeaways",
      "selector": [
        "#main-content > .section.grid-container:has(> .grid-container-inner > .grid-section.bg-f1f3ff)",
        "#main-content > .section.grid-container.regular-padding:has(.inner-grid.cols-1-10-1)"
      ],
      "style": "sky-radius-narrow",
      "blocks": [
        "cards-checklist"
      ],
      "defaultContent": [
        ".grid-section.grid-cols-8 > .custom-title-wrapper"
      ]
    },
    {
      "id": "s3",
      "name": "Article body with Related Content sidebar",
      "selector": [
        "#main-content > .section.grid-container:has(> .grid-container-inner > .grid-section.quote-container)",
        "#main-content > .section.grid-container.content-regular.no-padding.section-bottom-margin:not(.regular-padding)"
      ],
      "style": "sidebar",
      "blocks": [
        "quote",
        "accordion-plus",
        "story-cards"
      ],
      "defaultContent": [
        ".grid-section.grid-cols-8 > .custom-title-wrapper",
        ".grid-section.grid-cols-8 > .text-container-wrapper",
        ".grid-section.grid-cols-8 > .custom-image-wrapper",
        ".grid-section.grid-cols-2 > .eyebrow-text-wrapper"
      ]
    },
    {
      "id": "s4",
      "name": "Related Content",
      "selector": [
        "#main-content > .section.bg-f4f4f4.custom-title-container",
        "#main-content > .section.section-padding.bg-f4f4f4:has(.custom-title)"
      ],
      "style": "mist-bleed",
      "blocks": [
        "story-cards"
      ],
      "defaultContent": [
        ".custom-title-wrapper"
      ]
    }
  ]
};

const parsers = {
  'hero': heroParser,
  'cards-checklist': cardsChecklistParser,
  'quote': quoteParser,
  'accordion-plus': accordionPlusParser,
  'story-cards': storyCardsParser,
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
