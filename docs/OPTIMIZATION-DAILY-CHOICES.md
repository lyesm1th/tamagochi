# Stage 6: daily activity descriptions

Separated pure content for wishes, treasure stash, mischief, celebrations,
and companion-to-human comfort into `daily-choice-content.js`.

The existing photo album rendering (including frame borders, snapshots,
effects, calendar formatting and event handlers) remains unchanged inside
`app.js`. Original Ukrainian labels, choice modulus, filtering order,
fallbacks and celebration status expressions are preserved verbatim.
Regression tests cover positive/empty cases and verify the DOM-free module.

No sprite, wardrobe, player save format, game state, coin balance or
event timing changes.
