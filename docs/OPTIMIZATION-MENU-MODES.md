# Stage 6: menu modes and grooming labels

Continue the small-step refactor of the browser entry point. The lists of
journal, world and panel modes now come from a pure `createMenuModes` function,
and the per-species grooming label comes from `groomName` in menu-config.js.

The order of modes, duplicates, translated strings and per-species fallback
are preserved byte-for-byte. No gameplay, DOM, callbacks, save data, wardrobe,
animation or graphics have changed. Regression tests compare the original
expressions against the extracted functions.
