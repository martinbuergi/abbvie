# EDS conversion log — abbvie.com PGA TOUR page

## Publish decision

Publish (decided by the run brief, 2026-10-26): every delivered page, the redirects sheet and the
chrome documents (nav, footer) go live on the aem.live origin — deploy-batch.mjs without
--no-publish, chrome via POST https://admin.hlx.page/live/aemcoder/4b3558cc/main/<path>.

Target: org aemcoder · repo 4b3558cc · branch main · preview https://main--4b3558cc--aemcoder.aem.page/

## Foundation (C0)

- Decode tier: header/footer template-slotted from the gated prototype; chrome documents /nav, /footer (Robots noindex), published live.
- Fonts: F37 Lineca not rehosted; "Lineca Sub" (Wix Madefor Display, OFL) behind the brand family name.
- Section style names: sky, mist, mist-spaced, sky-short, mist-bleed, bleed, flush, radius, sky-radius.

## C-archetype — who-we-are-brand-partnerships-pga-tour

Content: `content/who-we-are/brand-partnerships/pga-tour.html` (schema `stardust/eds-schema/who-we-are-brand-partnerships-pga-tour.json`).
Editorial images rehosted to DA `media/pga-tour/` (13 files; the two AVIF sources — quote background,
Morgane story image — re-encoded to JPEG, DA media takes JPG/PNG/webp only).

| Prototype section | EDS | Tier | Section style |
|---|---|---|---|
| hero (+ breadcrumb) | `hero` (breadcrumb merged: it lives inside the hero card) | template-slotted | — (hero.css sets the section margin) |
| About band | `copy-band` | template-slotted | sky |
| video band | `video` | template-slotted | — |
| ambassador band | `media-copy` | template-slotted | mist-spaced |
| quote band | `quote` | template-slotted | bleed |
| partner logos | `partner-logos` (head = default content, reabsorbed, EW8) | reconstructive | — |
| cta band | `cta-band` | template-slotted | sky-short |
| "Related Content" title | default content (h5) | — | mist-bleed |
| story cards (+ spacer band) | `story-cards` (spacer = block padding) | reconstructive | mist-bleed |

- Brightcove ids are authored as player URLs (`players.brightcove.net/<account>/<player>_default/index.html?videoId=<id>`),
  `@ew-exempt` config: hero = ambient pydM0AMeC (autoplay muted loop, pause/play toggle, loads after `load`);
  video = Lj7UrCc1z with pydM0AMeC fallback, click/Enter loads the player in place.
- D1 🟡 (video, quote): kept as blocks — bespoke components (player, scrim + background layer), not prose.
- Heading levels kept from the source (h4 partner head, h3 CTA, h5 related title, h4 card titles) for replica parity.
- Mobile breadcrumb toggle repeats the current item as a presentational copy (EW4); the authored `<ul>` stays editable.
- No `stardust/redirects.tsv` yet (Phase D); localize-links ran without `--redirects` — 0 in-scope links left absolute.
- Preview gate (gate-all, published regime): 1440 2.66% Δh 0, 360 3.13% Δh 0, clip 0, presence 0 — PASS both.
  Fix rounds: (1) card category exposed as a level-2 heading (source outlines it as h2), ambient
  player keeps only its hidden control bar (dialogs/overlays removed: ai-readability code 94% → 100%);
  (2) scoped override reserving the footer social-icon row (foundation request queued).
- Header contract: the live origin bot-challenges chrome-explore (stealth + headed tiers); compared
  against the gated prototype's header instead — chrome-compare exit 0 (4 🟡).
