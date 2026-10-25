# Stage 3: detailed actor uses one emotional snapshot per frame

This is a narrowly reviewed change to the protected graphical renderer's
**logic**, not its art or geometry. The frame now captures `now` once,
resolves `emotionalAppearance` once and shares it with `dressedSprite`.

The previous `dressedSprite` public API remains compatible through a trailing
optional argument. Non-expression rendering and the sleep/dinosaur guards stay
unchanged. The state shape, coordinates, clothing paths, art, and animation
formula are unchanged.

The visual baseline's Git blob SHA is advanced ONLY for
`public/detailed-renderer.js`; all 57 other baseline hashes remain identical.
This exception is explicit because the same source file is protected by
the pixel-art safety suite. New regression tests guard the single-snapshot
invariant. CI must pass before merging to main.
