# Dynamic features plan — PGA TOUR page

1. Recreate (replica Phase 3): video band poster + play button wired to the Brightcove player
   (account 2157889328001, player pydM0AMeC, video 6406773145112) on click; header dropdowns and
   search toggle; external-link departure modal.
2. Deploy (rollout C-deliver): `brightcove-video` block keeps account/player/video ids as authored
   cells; header behaviours ship in the header block; departure modal as a delayed widget.
3. Verify (dynamics Phase 5): play click mounts the player; dropdowns open; departure modal fires on
   an external link.
4. Decision batch D1 (search), D2 (tags + consent) — interim tiers ship, decisions recorded.
