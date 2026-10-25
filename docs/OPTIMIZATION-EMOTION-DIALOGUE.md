# Stage 3: reuse a single emotional snapshot for dialogue

`emotionLineFor(pet, snapshot)` deterministically selects an emotional
sentence from a previously resolved `emotionOf(pet, now)` result.

The original `emotionLine(pet, now)` API remains intact as a wrapper. The
species-specific quote ordering, seed and fallback behavior are preserved.

This enables future callers to use one resolved emotion for the text, mood
and other behaviors at a given instant, without making each subsystem
re-decide priorities. The change does NOT modify presentation/animation,
palette, position, player save schema, wardrobe or any persisted data.
