# Stage 6: Little World panel text as a pure view model

Extracted the descriptions of secrets, sandbox, stories, world destinations,
rituals, weather, walks, activities, dreams and pet forms to
`public/world-mode-content.js`. The previous painting order remains in
`app.js`: normal portrait, second overlay draw for secrets/stories, and the
sandbox canvas overlay. Wallet, style, journal, cozy, playroom and daily
routing are unchanged.

The helper takes all game catalog providers and the clock as dependencies
so walk/activity expiry uses the same strict comparison and only reads
time when needed. Exact original Ukrainian texts and branching preserved.
Regression tests cover every mode and active/expired sessions.

No sprite assets, wardrobe coordinates, behavioral algorithms, purchases,
network calls, persistence or permission logic were changed.
