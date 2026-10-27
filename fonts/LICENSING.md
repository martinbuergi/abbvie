# Font licensing — confirm before go-live

| File | Family | Foundry / license | Status |
|---|---|---|---|
| roboto-regular.woff2, roboto-bold.woff2, roboto-light.woff2 | Roboto Regular / Bold / Light | Google, Apache 2.0 | OK to self-host |
| wix-madefor-display-latin.woff2 | "Lineca Sub" (stand-in for F37 Lineca) | Wix, SIL OFL 1.1 | OK to self-host |
| abbvie-icon.woff2 | Abbvie Icon | AbbVie brand icon font (proprietary) | Confirm web-embedding rights for this origin |
| (not shipped) | F37 Lineca Medium / Book | F37 Foundry, commercial | NOT shipped; stacks name it first and fall to "Lineca Sub" |

Remove path: delete a woff2 and its `@font-face` in `styles/fonts.css`; the stacks then fall to
the metric-matched local fallbacks declared in `styles/styles.css`.
