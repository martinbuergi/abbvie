---
_provenance:
  writtenBy: stardust:dynamics (via stardust:replica Phase 2, hands-off)
  writtenAt: 2026-10-26T13:55:00Z
  readArtifacts: [stardust/current/_dynamics.json, stardust/dynamics/dynamic-features.generated-plan.json]
---

# Dynamic features — abbvie.com PGA TOUR page (1 archetype)

Generated plan: `stardust/dynamics/dynamic-features.generated-plan.{md,json}` (49 rows). Every row
has a disposition below; grouped rows share one.

## Listings contract

No listing on the page. "Related Content" shows two story cards (static capture, rendered as
authored cards; source reads `/query-index-en.json`, but the two cards are a fixed authored pair on
this page) — disposition `static-snapshot`, reproducibility `self`.

## Features

| id(s) | class | feature | disposition | reproducibility | status |
|---|---|---|---|---|---|
| v-video-brightcove, v-player-element-*, cr-client-rendered-slot-vjs-* (10 rows) | V / CR | Brightcove video band (band: account 2157889325001, player Lj7UrCc1z, video 6404881113112 — 30 s, corrected at D2 2026-10-26 from the hero clip ids; hero ambient: account 2157889328001, player pydM0AMeC, video 6406773145112): poster + title + "Watch 0:30" button; click loads the Brightcove player | embed-passthrough — poster band rebuilt statically, play button loads the same Brightcove player on click | self | planned (recreate + deploy) |
| v-video-youtube, v-iframe-without-src-runtime-injected-embed | V | YouTube iframe API loaded by chrome (footer social link only); no in-page YouTube embed | static-snapshot (link only) | self | planned |
| cr-main-empty-at-load-filled-after-client-rendered-page | CR | source is a block-decorated page (EDS-style): main fills after decoration | static-snapshot — the capture is complete (8 headings, 3997 chars main text), migrated as authored content | self | planned |
| m-modal-trigger-aria-haspopup-* | M | header mega-nav dropdowns + search toggle | rebuild-native (header block) | self | planned |
| m-modal-trigger-data-warn-departure-modal-path-* | M | external-link departure warning modal | rebuild-native (delayed widget on external links) | self | planned |
| s-site-search-form-search-results | S | header search form → /search-results | index-backed — the form posts to the source's `/search-results` route (no results page in this one-page scope) | needs-business-decision | decision batch D1 |
| d-first-party-data-file-get-* (5 rows) | D | /placeholders.json, /ab-config.json, /query-index-en.json, /redirects.json, /tags.json | data-fed — host-bound on the new origin; only redirects.json matters for this page (a redirects sheet is delivered) | self | planned |
| a-cms-app-settings-object-datalayer | A | dataLayer object | static-snapshot (martech scaffolded off) | self | interim |
| t-*, a-unknown-third-party-host-* (23 rows) | T / A | OneTrust consent, GTM, GA/Ads, Reddit, Twitter, Bing, Facebook, TikTok, Siteimprove, session replay, Cloudflare insights, Bowen Craggs, 7-groupoperation | embed-passthrough, scaffolded OFF (martech only on owner request) | needs-business-decision | decision batch D2 |

## Decision batch (owner)

- **D1 — site search.** Interim: the header search form keeps the source's markup and submits to
  the source's `/search-results`. Owner decides whether the new origin gets its own results page.
- **D2 — tags and consent.** Interim: no third-party tags or consent manager on the new origin
  (scaffolded off). Owner decides which tags, and the consent manager, move to the new host.

## Register

No row writes `decided-out`. Hands-off interim tiers above are recorded by name.
