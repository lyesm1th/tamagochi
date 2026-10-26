# Stage 6: cozy-screen text-only view model

The shop, wardrobe, kitchen, peace and night UI descriptions are separated
into `cozy-choice-content.js`, leaving artwork, interaction handlers and
persistent state in `app.js`. Belongings and hide rendering remains inline
because it paints specific previews.

The original Ukrainian phrases, checks, costs and evaluation priorities are
preserved. Kitchen session expiry uses a passed timestamp. Regression tests
cover owned/stored items, worn clothing, recipes, timed cooking, and other
mode fallbacks. No saved player data, sprite graphics, or APIs are changed.
