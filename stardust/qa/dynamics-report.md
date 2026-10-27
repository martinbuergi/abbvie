# Dynamics parity check — https://main--4b3558cc--aemcoder.aem.live — 2026-10-26T15:46:14.268Z

Replayed 5 checks over 5 features · pass 5 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| v-video-brightcove | V | verified | video-plays | PASS | iframe/video: false · video playing (Δt 0.80s) · playback requests 28 (ok) | players.brightcove.net:200×2 vjs.zencdn.net:200×1 metrics.brightcove.com:200×14 edge.api.brightcove.com:200×2 cf-images.us-east-1.prod.boltdns.net:200×2 :200×7 manifest.prod.boltdns.net:200×11 fastly-signed-us-east-1-prod.brightcovecdn.com:200×10 |
| m-modal-trigger-data-warn-departure-modal-path | M | verified | click-dialog | PASS | dialog 880px · heading "You are about to leave the AbbVie website" · 0 fields · Escape closes: true | players.brightcove.net:200×1 vjs.zencdn.net:200×1 edge.api.brightcove.com:200×1 metrics.brightcove.com:200×7 cf-images.us-east-1.prod.boltdns.net:200×1 :200×3 manifest.prod.boltdns.net:200×5 fastly-signed-us-east-1-prod.brightcovecdn.com:200×3 |
| m-modal-trigger-aria-haspopup | M | verified | dom-count | PASS | 7 × header .nav-section (min 1) | players.brightcove.net:200×1 vjs.zencdn.net:200×1 edge.api.brightcove.com:200×1 metrics.brightcove.com:200×7 cf-images.us-east-1.prod.boltdns.net:200×1 :200×3 manifest.prod.boltdns.net:200×5 fastly-signed-us-east-1-prod.brightcovecdn.com:200×2 |
| d-first-party-data-file-get-redirects | D | verified | fetch-json | PASS | 200 · 3 rows · keys :type,total,limit,offset,columns,data |  |
| page-errors | CR | verified | no-page-errors | PASS | none on 1 page(s) |  |

## Features without checks
