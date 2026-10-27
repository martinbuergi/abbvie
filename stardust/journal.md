# Journal — abbvie.com PGA TOUR page replica

## Extract — bounded single-page capture of the PGA TOUR page (2026-10-26)

- `crawl.mjs --pages /who-we-are/brand-partnerships/pga-tour.html --dynamics`: 1/1 captured headless, HTTP 200, no bot wall for the browser. Slug aligned to the site plan: `who-we-are-brand-partnerships-pga-tour`.
- Vision check ok: hero (golf image + Birdies for Brain Health lockup), intro, About section, AbbVie × PGA TOUR lockup, dark CTA band, ambassador, quote over image, partner-logo row, Power of Partnership band, related stories, footer.
- OneTrust cookie notice (close-only): dismiss with `.onetrust-close-btn-handler` in every live capture.
- Source is itself a block-based site (`/styles/abbvie/blocks/*`). 23 stylesheets + 6 fonts harvested via browser network intercept (plain HTTP to the origin answers 403) into `stardust/current/assets/{css,fonts}`.
- Fonts: F37 Lineca (licensed, not rehosted → substitute, brand name first in the stack), Roboto (open, self-host), abbvie-icon.ttf (brand icon font).
- Style census at 1440 + 360 → `_computed-styles.json`. 9 same-site data endpoints recorded in the dynamic surface.

## Preserve direction — bounded-single spec, empty register, dynamics triaged (2026-10-26)

- Bounded promotion branch: PRODUCT.md, DESIGN.md, DESIGN.json synthesized at the root from the page JSON, the style census, the source tokens.css and the cap probe (provenance `bounded-single`). `stardust/direction.md` records preserve mode.
- Cap probe: 9 of 10 sections capped at 1440 px, one full-bleed; shell fluid; probeWidth 2560. Source layout steps 744 / 1024 / 1440 (min-width), kept (no target breakpoints).
- Inconsistency register empty — pure replica.
- Dynamics: 49 findings triaged into `stardust/dynamic-features.md` (+ plan). Page-relevant: Brightcove video band (account 2157889328001 / player pydM0AMeC / video 6406773145112), header dropdowns + search, external-link departure modal. Martech scaffolded off; decisions D1 (search) and D2 (tags/consent) recorded with interim tiers.

## Recreate — PGA TOUR archetype re-authored and gated (2026-10-26)

- Clean semantic HTML/CSS/JS prototype `stardust/prototypes/who-we-are-brand-partnerships-pga-tour-proposed.html` (+ .css, .js), values lifted from the source's block CSS (rem = 10px), header and footer included. Generated from `stardust/.work/proto-template.html` via `assemble.py`.
- Fonts: Roboto self-hosted; F37 Lineca (licensed) substituted by Wix Madefor Display ("Lineca Sub", OFL) after a width/x-height match against the captured face (line widths within ~1%); brand family first in every stack; Book face size-adjust 101.4%, ascent/descent overridden to Lineca's metrics.
- Images and icons harvested via browser response intercept into `stardust/prototypes/media/`.
- Interaction parity: header dropdowns, scroll hide/show nav, hero ambient Brightcove player, video-band click-to-play, back-to-top implemented; hover rules dropped (no live change measured).

## Source-fidelity gate — 1440 0.81 % / 360 1.00 %, Δh 0 (2026-10-26)

- iter1 baseline + 3 fix rounds per width (cap reached); final `--full` iter4: 1440 pixel 0.81 %, Δh 0, content-diff 0 🔴; 360 pixel 1.00 %, Δh 0, 1 🔴 ICON DIFF (YouTube footer icon — source serves SVG bytes under `.avif`; same bytes as `.svg` in the build: capture-state residual). Clipped 0, no overflow, cap-probe PASS at 2560. Prototype gate table (`gate-all --stage prototype`) 1 PASS at 1440 and 360.
- Residuals: font-substitution glyph shapes (quote band 4.2 % at 1440, 8.3 % band at 360 — within bar).
- Open note for delivery: live video band uses Brightcove player Lj7UrCc1z (domain-locked); prototype falls back to pydM0AMeC.

## Migrate plan, render, assets, report — archetype rendered to stardust/migrated (2026-10-26)

- plan: one approved archetype (`who-we-are-brand-partnerships-pga-tour`), approved-page branch, no siblings.
- render: `migrate.mjs render` → `stardust/migrated/who-we-are/brand-partnerships/pga-tour.html` (10 sections, 42 assets; the archetype CSS passed as canon). 74 links point at source pages outside this one-page scope — repointed to the source origin at the link audit.
- assets / report: assets bundled beside the page; no refusals.

## A-inventory — 1 page, 1 template (2026-10-26)

- `inventory.mjs`: 1 page in scope (the whole site for this run), template `who-we-are-brand-partnerships-pga-tour`. Block ids set on the sidecar: hero, breadcrumb, video, quote, partner-logos, cta-band, story-cards. `rollout.json` site: aemcoder/4b3558cc@main, live host main--4b3558cc--aemcoder.aem.live.

## B-block — 7 distinct blocks, representative-first plan (2026-10-26)

- `blocks.mjs` + `plan.mjs`: 7 module blocks, each converted once on the one page (hero, breadcrumb, video, quote, partner-logos, cta-band, story-cards); header/footer ship with the foundation.

## B2-dynamic — dynamic surface re-checked against the target host (2026-10-26)

- `dynamics-plan.mjs --target-origin` re-run; `stardust/dynamic-features.md` rows unchanged (video band embed-passthrough, header menus/search rebuild-native, departure modal widget, martech off; D1/D2 interim tiers).

## C-deliver — unit foundation done (2026-10-26)

- C0 subagent: runtime contract, styles (tokens lifted from the gated prototype), self-hosted Roboto + "Lineca Sub" (Wix Madefor Display) + Abbvie Icon, favicon, template-slotted header (dropdowns, scroll hide/show, mobile menu) and footer (back-to-top), departure-warning widget in delayed.js, /nav + /footer documents (noindex) PUT → preview → live. Lint clean. Commit d6b7b1b pushed.
- Header bar 99.17 % / 99.90 % match vs prototype on preview; footer heights equal. The published-origin header/footer bands are judged on the archetype page (a one-page roster has no separate shell page).
- Open: mega-menu panels carry only CLOSE (live panel content never captured); mobile menu built from a live 360 probe, unmeasured in pixels; search posts to the source (D1).
- `foundation-freeze.mjs freeze` recorded.

## C-deliver — units archetype and cluster done (2026-10-26)

- Archetype subagent: 8 blocks (hero incl. breadcrumb, copy-band, video, media-copy, quote, partner-logos, cta-band, story-cards), each `block-roundtrip --ew` exit 0; content doc PUT → preview → live; 13 editorial images on DA (`media/pga-tour/`); ai-readability 100.
- Published-origin gate (gate-all --only, preview host): 1440 2.66 % Δh 0, 360 3.13 % Δh 0, clip 0, presence 0. gate.sh pub rounds 0.80 % / 0.99 %. Header crop 0.16 / 0.00 %, footer crop 0.51 / 0.80 %; chrome-compare exit 0 (header source = gated prototype; the live header explorer is refused by the origin).
- Fix rounds 2 of 3: story-card category heading role; hero player hidden dialogs removed (ai-readability 94 → 100); footer lazy icons reserve height (scoped override + foundation request queued).
- Cluster unit: no siblings in this one-page scope — recorded done with 0 pages.

## C-deliver — unit gate-all done (2026-10-26)

- C-final prelude: `foundation-freeze.mjs check` unchanged (20 files); the one queued request applied once — footer social icon `min-height: 24px` moved into `blocks/footer/footer.css`, the scoped override removed from `blocks/hero/hero.css` (d2a3a2c, pushed, propagated to preview).
- Archetype re-gated on preview: 1440 2.66 % Δh 0, 360 3.13 % Δh 0, clip 0, presence 0.
- Roster gate-all on the published origin (`--skip-existing --recapture-eds`): 1/1 PASS at both widths; `update-coverage.mjs --gate` run for all-1440 and all-360.

## C-deliver — unit final done, phase end (2026-10-26)

- Foundation re-frozen after the C-final request application (check clean, 20 files); request line marked applied; `npm run lint` clean.
- All five units done: foundation, archetype, cluster (0 siblings), gate-all, final. 1/1 page live and PASS on the published origin.

## D-site — root redirects to the page, sitemap verified (2026-10-26)

- Redirects sheet PUT → preview → live (3 rows: `/`, `/index.html`, legacy `.html` → the delivered page); `/` 301 → 200 on both origins. Decision recorded in direction.md.
- `assemble.mjs` 1 url; `--verify-origin` aem.live exit 0 — served 1 = assembled 1, extra 0, missing 0. /nav and /footer carry robots noindex.

## D2-dynamic — parity replay 5/5 PASS; video band corrected (2026-10-26)

- `stardust/dynamics/parity.json` authored (video-plays, departure dialog, header nav sections, redirects.json, no page errors); `dynamics-check.mjs --origin` aem.live: 5/5 PASS.
- Defect found by the replay: the "Watch 0:30" band played the hero's 3.6 s ambient clip. Observed on the source: the band's player is Lj7UrCc1z on account **2157889325001** (not …328001), video 6404881113112 "AbbVie Birdies for Brain Health", 30 s, unmuted. The earlier "domain-restricted" reading was the wrong account (404). Content doc corrected (account + video id, dead fallback link removed), re-PUT → preview → live; prototype + migrated copies aligned. Now plays the 30 s film with sound, as on the source.

## E-full-site — 1/1 verified (2026-10-26)

- `verify.mjs --base` aem.live: 1 checked, 1 verified, 0 failed; gate summaries (all-1440, all-360) re-applied to coverage.
- Headless render check: hero ambient video autoplays (currentTime advancing, muted loop); video band plays the 30 s film on click.

## E2-link-audit — 104/104 hrefs resolve (2026-10-26)

- `localize-links.mjs`: 1 link localized (nav logo → `/`), out-of-scope source links kept absolute (scope extension, decision in direction.md); `--check` exit 0. /nav re-PUT → live (noindex kept).
- GET of every href on the live page + nav + footer: 104 distinct; 21 answer 200 to curl; the other 83 (abbvie country sites, investors, facebook) refuse non-browser clients and answer 200 in Chromium. 0 dead links. Record: `stardust/rollout/link-audit.txt`.

## F-optimize — health 100, 0 open findings (2026-10-26)

- `optimize.mjs --base` aem.live `--all`: open P1 0 · P2 0 · P3 0; one informational source-parity P2 (no JSON-LD — the source has none either). Gate exit 0.

## G-aem — nothing to fix (2026-10-26)

- `autofix-aem.mjs --project . --dry-run`: 0 candidates (no open findings); no project edits, no re-deploy.

## H-report — summary written (2026-10-26)

- `stardust/rollout/report.md`: 1/1 verified, 7 blocks converted, gates and quality numbers, owner follow-ups (search D1, font substitution). Two learnings appended to `stardust/learnings.md`.

## I-dashboard — dashboard written (2026-10-26)

- `dashboard.mjs` → `stardust/rollout/dashboard/index.html` + data.json: 1 page identified, prototyped, deployed.

## Handoff — run complete (2026-10-26)

- migrate → deploy → rollout A–I done for the single page; runner done-check: complete, 0 gaps.
- Live: https://main--4b3558cc--aemcoder.aem.live/who-we-are/brand-partnerships/pga-tour (root `/` redirects to it). Gate 1440 2.66 % / 360 3.13 %, Δh 0; dynamics 5/5; links 104/104; optimize health 100.
