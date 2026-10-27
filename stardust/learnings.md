
## 2026-10-26 — abbvie.com PGA TOUR (replica, one page)

- A Brightcove band can live on a different account than the hero player on the same page (here …325001 vs …328001). A player script 404 on one account read as "domain-restricted" and a fallback player silently played the wrong (hero) clip; only the D2 `video-plays` replay with duration/name exposed it. Read account + player + video id from the source's own click, never infer from the first player on the page.
- Plain HTTP clients get 403 from the owner's country sites; the link audit needs a browser pass for those before calling anything dead.
