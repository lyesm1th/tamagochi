# Quiet relationship details

Three additions, without more root menus or more frequent autonomous activity:

- Quiet mood silhouettes: content, tired, unwell and withdrawn. Static, subtle transforms of the whole dressed pet in both graphics modes; reduced motion leaves the sprite unchanged. Manual actions and recovery always take precedence.
- Bedtime affection: petting within ten minutes before manual sleep or bed rest, on three different local calendar days, teaches a bedtime ritual. Around the learned hour, a tired pet may ask for species-appropriate affection. The visual invitation uses the existing shared room slot, not an additional timer. Critical needs take priority. No rewards, penalties, streak resets or obligation to respond.
- Bounded object memories: new things, repairs and broken items are remembered (24 records maximum). Later interactions can mention a real prior event instead of a generic line. An event is not recalled immediately after it happens. Saves without this data remain compatible.

Tests: `node --test tests/relationship-life.test.js tests/calm-behavior.test.js`.
Browser regression: `docs/detailed-preview/calm-check.mjs` verifies stationary rest, immediate manual input and recovery in both modes. No changes to reminder delivery, request retry protection, balances, graphics atlases or owner secrets.
