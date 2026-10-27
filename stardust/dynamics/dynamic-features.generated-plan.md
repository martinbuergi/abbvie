<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-26T14:27:03.694Z · input stardust/current/_dynamics.json (1 pages, 49 findings) · target probe https://main--4b3558cc--aemcoder.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · target = the delivery form (widget where no authored rows remain) · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | target | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-www-google-com | A | unknown third-party host www.google.com | 1/1 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-unknown-third-party-host-pixel-config-reddit-com | A | unknown third-party host pixel-config.reddit.com | 1/1 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-unknown-third-party-host-alb-reddit-com | A | unknown third-party host alb.reddit.com | 1/1 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 4 | a-unknown-third-party-host-t-co | A | unknown third-party host t.co | 1/1 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 5 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 1/1 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 6 | cr-client-rendered-slot-video-js-hero-bc-player-vjs-play-but | CR | client-rendered slot video-js hero-bc-player vjs-play-button-position-top-right | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 7 | cr-client-rendered-slot-vjs-loading-spinner | CR | client-rendered slot vjs-loading-spinner | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 8 | cr-client-rendered-slot-vjs-control-bar | CR | client-rendered slot vjs-control-bar | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 9 | cr-client-rendered-slot-vjs-seek-to-live-control-vjs-control | CR | client-rendered slot vjs-seek-to-live-control vjs-control | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 10 | cr-client-rendered-slot-vjs-descriptions-button-vjs-menu-but | CR | client-rendered slot vjs-descriptions-button vjs-menu-button vjs-menu-button-popup | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 11 | cr-client-rendered-slot-vjs-menu | CR | client-rendered slot vjs-menu | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 12 | cr-client-rendered-slot-vjs-menu-content | CR | client-rendered slot vjs-menu-content | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 13 | cr-client-rendered-slot-vjs-menu-item-vjs-selected | CR | client-rendered slot vjs-menu-item vjs-selected | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 14 | cr-client-rendered-slot-vjs-quality-menu-wrapper-vjs-menu-bu | CR | client-rendered slot vjs-quality-menu-wrapper vjs-menu-button vjs-menu-button-popup | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 15 | cr-client-rendered-slot-vjs-subs-caps-button-vjs-menu-button | CR | client-rendered slot vjs-subs-caps-button vjs-menu-button vjs-menu-button-popup | 1/1 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 16 | cr-main-empty-at-load-filled-after-client-rendered-page | CR | main empty at load, filled after (client-rendered page) | 1/1 | static-snapshot | content | needs-human-capture | pending | client-rendered-page | human-browser capture; never migrate blank |  |
| 17 | d-first-party-data-file-get-placeholders-json | D | first-party data file GET /placeholders.json | 1/1 (reach 1/1) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 18 | d-first-party-data-file-get-ab-config-json | D | first-party data file GET /ab-config.json | 1/1 (reach 1/1) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 19 | d-first-party-data-file-get-query-index-en-json | D | first-party data file GET /query-index-en.json | 1/1 (reach 1/1) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 20 | d-first-party-data-file-get-redirects-json | D | first-party data file GET /redirects.json | 1/1 (reach 1/1) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 21 | d-first-party-data-file-get-tags-json | D | first-party data file GET /tags.json | 1/1 (reach 1/1) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 22 | m-modal-trigger-aria-haspopup-chrome-only-div-form-button-co | M | modal trigger aria-haspopup (chrome only) → div:form/button:content | 1/1 (reach 11/1) | rebuild-native | runtime | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 23 | m-modal-trigger-data-warn-departure-modal-path-chrome-only-t | M | modal trigger data-warn-departure-modal-path (chrome only) → target outside DOM at capture | 1/1 (reach 10/1) | rebuild-native | runtime | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 24 | s-site-search-form-search-results | S | site search form → /search-results | 1/1 (reach 0/1) | index-backed | widget | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 25 | t-unknown-third-party-host-static-cloudflareinsights-com | T | unknown third-party host static.cloudflareinsights.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 26 | t-unknown-third-party-host-vjs-zencdn-net | T | unknown third-party host vjs.zencdn.net | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | t-unknown-third-party-host-delivery-p157365-e1666014-adobeae | T | unknown third-party host delivery-p157365-e1666014.adobeaemcloud.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 28 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 29 | t-consent-onetrust | T | consent: OneTrust | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 30 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 31 | t-unknown-third-party-host-www-redditstatic-com | T | unknown third-party host www.redditstatic.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 32 | t-unknown-third-party-host-siteimproveanalytics-com | T | unknown third-party host siteimproveanalytics.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 33 | t-unknown-third-party-host-static-ads-twitter-com | T | unknown third-party host static.ads-twitter.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 34 | t-analytics-session-replay | T | analytics: session replay | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 35 | t-unknown-third-party-host-www-7-groupoperation-com | T | unknown third-party host www.7-groupoperation.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 36 | t-unknown-third-party-host-analytics-twitter-com | T | unknown third-party host analytics.twitter.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 37 | t-unknown-third-party-host-3407-global-siteimproveanalytics- | T | unknown third-party host 3407.global.siteimproveanalytics.io | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 38 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 39 | t-unknown-third-party-host-c-bing-com | T | unknown third-party host c.bing.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 40 | t-unknown-third-party-host-www-facebook-com | T | unknown third-party host www.facebook.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 41 | t-unknown-third-party-host-analytics-ipv6-tiktokw-us | T | unknown third-party host analytics-ipv6.tiktokw.us | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 42 | t-unknown-third-party-host-capi-automation-s3-us-east-2-amaz | T | unknown third-party host capi-automation.s3.us-east-2.amazonaws.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 43 | t-unknown-third-party-host-app-bowencraggs-com | T | unknown third-party host app.bowencraggs.com | 1/1 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 44 | v-video-brightcove | V | video: Brightcove | 1/1 | embed-passthrough | content | self | pending | media-as-url | none (player ids are public) |  |
| 45 | v-video-youtube | V | video: YouTube | 1/1 | embed-passthrough | content | self | pending | media-as-url | none (player ids are public) |  |
| 46 | v-player-element-div | V | player element <div> | 1/1 | embed-passthrough | content | self | pending | media-as-url | none (player ids are public) |  |
| 47 | v-player-element-video-js | V | player element <video-js> | 1/1 | embed-passthrough | content | self | pending | media-as-url | none (player ids are public) |  |
| 48 | v-player-element-video | V | player element <video> | 1/1 | embed-passthrough | content | self | pending | media-as-url | none (player ids are public) |  |
| 49 | v-iframe-without-src-runtime-injected-embed | V | iframe without src (runtime-injected embed) | 1/1 | embed-passthrough | embed | needs-human-capture | pending | embed-passthrough | resolve the runtime src from a rendered capture |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 24 row(s) — read-settings, settled-dom-snapshot, sheet-sync, chrome-interaction, search-index-backed, media-as-url.
- **One owner decision batch:** 25 row(s) — inspect the XHR, add a vendor row · human-browser capture; never migrate blank · which tags run on the new host; property ids · CMP domain script reuse on the new host · resolve the runtime src from a rendered capture.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 5 of 5 probed API paths — the off-origin data work.

## Phases

- **tags** — 19
- **capture** — 11
- **detect** — 5
- **data** — 5
- **media** — 5
- **interactive** — 2
- **search** — 1
- **embeds** — 1
