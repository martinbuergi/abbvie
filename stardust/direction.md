---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-26T13:51:22Z
  againstInput: https://www.abbvie.com/who-we-are/brand-partnerships/pga-tour.html
  readArtifacts:
    - stardust/current/pages/who-we-are-brand-partnerships-pga-tour.json
    - stardust/current/_computed-styles.json
    - stardust/current/assets/css/styles_tokens.css
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of
https://www.abbvie.com/who-we-are/brand-partnerships/pga-tour.html (no direct invocation, no
creative decisions).

Synthesized (bounded-single): current/pages/who-we-are-brand-partnerships-pga-tour.json + Phase-3 CSS lift
→ PRODUCT.md · DESIGN.md · DESIGN.json (at 2026-10-26T13:51:22Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Fonts: F37 Lineca (licensed) is not rehosted; a metric-matched substitute follows the brand family
name in every stack (recorded in recreation). Roboto is self-hosted from the captured woff2.

## Decision — site root (D-site, 2026-10-26)

The run brief makes the single delivered page the site root. The source root (www.abbvie.com/) is a
different page outside this run's scope, so it is not delivered; instead the redirects sheet
(`/redirects.json`, mirrored in `stardust/redirects.tsv`) carries `/`, `/index.html` and the legacy
`/who-we-are/brand-partnerships/pga-tour.html` → `/who-we-are/brand-partnerships/pga-tour` (301),
published live. `curl -sIL` on `/` ends in 200 on aem.page and aem.live.

## Decision — link targets outside the one-page scope (E2-link-audit, 2026-10-26)

This run's scope is one page, so every other abbvie.com target linked from the page, the nav and the
footer (≈ 35 distinct paths: /who-we-are, /science, /patients, /join-us, /sustainability,
/contact-center/…, /privacy-center/…, legal pages, …) is SCOPE EXTENSION: kept as absolute links to
www.abbvie.com (the source site), never a 404 on the new origin. The logo's home link is localized to
`/`, which the redirects sheet resolves to this page. Full list with statuses:
`stardust/rollout/link-audit.txt`.
