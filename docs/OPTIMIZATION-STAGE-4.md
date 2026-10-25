# Stage 3 closed: unified emotional state

The catalog, automatic need priority, sentence selection, and both visual styles
now accept the same canonical emotional state in their relevant frame/episode.
Historic recipes, dialogue text, movement formulas, and graphics are preserved.

# Stage 4 opened: automatic behavior slot reuse

`ambient()` already chose its ambient slot but called `chatter()`, which
recalculated the same slot. The chatter API now accepts an optional previously
computed slot. Existing callers without this argument keep the original path.

There are no changes to slot timing, priority, manual-activity blocking,
ambient dialogue, response IDs, pet persistence, graphics, room items or API.
Regression tests compare the two paths over many simulated ticks.
