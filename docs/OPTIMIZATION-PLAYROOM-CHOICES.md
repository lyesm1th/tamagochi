# Stage 6: playroom choice text extracted

Separated the label/description logic of the playroom's toys, crafting,
and decoration views into `public/playroom-choice-content.js`.
DOM painting, player state, event handlers, and room rendering stay in
`app.js`. Every original conditional expression and Ukrainian string
is preserved; the session-expiry clock is injected.

Regression tests cover owned and unowned toys, completed skill badges,
running sessions at the expiry boundary, recipes with resource counts,
decoration variants, and unknown modes. No art, sprite layout, saved data,
coin costs, or gameplay behavior changed.
