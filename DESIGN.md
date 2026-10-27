---
_provenance:
  writtenBy: stardust:replica
  mode: bounded-single
  writtenAt: 2026-10-26T13:51:22Z
  synthesizedFrom:
    - stardust/current/pages/who-we-are-brand-partnerships-pga-tour.json
    - stardust/current/_computed-styles.json
    - stardust/current/assets/css/styles_tokens.css
colors:
  text: "#071d49"          # --corp-color-text-default
  background: "#ffffff"    # --color-surface-default
  accent: "#0066f5"        # --color-accent-blue / --corp-color-text-accent
  link: "#035fe6"          # --corp-color-link-default
  surface-highlight: "#f1f3ff"  # --color-surface-highlight
  surface-gray: "#f4f4f4"  # --color-gray-light (bg-f4f4f4 sections)
  border-container: "#a6b5e0"
  muted: "#666b7a"         # --color-gray-dark
typography:
  heading: '"F37 Lineca Medium", Helvetica, Arial, sans-serif'   # --heading-font-family-bold
  heading-book: '"F37 Lineca Book", Helvetica, Arial, sans-serif' # --heading-font-family
  body: '"Roboto Regular", Helvetica, Arial, sans-serif'
  body-bold: '"Roboto Bold", Helvetica, Arial, sans-serif'
  body-light: '"Roboto Light", Helvetica, Arial, sans-serif'
  icon: '"Abbvie Icon"'
rounded:
  control: 2px            # census radius mode
  section-xl: "8rem @>=1024, 6.4rem @>=744"  # --border-radius-xl (rem = 10px)
  pill: 50%
layout:
  container-max-width: 1440px   # cap-probe: 9 of 10 sections capped at 1440
  breakpoints: [744, 1024, 1440] # source @media steps (min-width)
---

# Design — abbvie.com PGA TOUR page (bounded-single, descriptive)

The target is the captured current state. Every value above traces to the source's own
tokens.css custom properties, the computed-style census or the cap probe; nothing is invented.

- Type: F37 Lineca (licensed commercial face) for headings, Roboto for body and buttons.
  F37 Lineca is not rehosted on the new origin: a metric-matched substitute follows the brand
  name in the stack (chosen and measured in recreation, recorded in direction.md).
- Colour: navy #071d49 text on white; blue #0066f5 accent; pale blue #f1f3ff and grey #f4f4f4
  section surfaces; a dark navy video band.
- Shape: large top-left/right section radius (80px at desktop) on the hero and the footer;
  2px control radius; circular back-to-top control.
- Page structure (from the capture): header · hero (image + lockup, breadcrumb, H1, intro) ·
  About copy · AbbVie × PGA TOUR lockup · video band · ambassador (image + copy) · quote over
  image · partner logo row (6) · Power of Partnership band with CTA · Related Content (2 story
  cards) · footer.
