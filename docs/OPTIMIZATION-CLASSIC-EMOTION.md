# Stage 3: single classic-mode emotion snapshot

The classic actor previously called `emotionalAppearance(s,Date.now(),reduced)`
twice per frame, once before painting the actor and once after composing its
wardrobe. A phase change between those calls could result in different tear
or gesture values inside one visual frame.

The classic renderer now reuses its initial `expression` for the second
step. The detailed-mode renderer continues to use the same canonical
`emotionalAppearance` implementation. No geometry, color, timing threshold,
clothing placement, rendering formula, persistable data or server code is changed.

This is a deliberately limited synchronization refactor. Canvas-based tests
check both dressed and undressed classic rendering and unchanged saved state.
