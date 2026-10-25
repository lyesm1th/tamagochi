# Stage 5: exact snapshot cache for dressed expressions

A dressed actor can be painted more than once with the same emotional
snapshot. Derived expression canvases are now reused only when the base
outfit canvas AND the exact emotion/strength/gesture/blink/tear values match,
including sprite identity, age atlas and padding. No quantization is applied.

Any animation change forces a fresh expression render, so tears, blink and
mouth motion follow the existing formulas and timing with no stale frames.
A WeakMap uses outfit canvas identity and cannot keep evicted outfits alive.
Only the last expression per base canvas is held.

No art, clothing positioning, pet geometry, save schema, or animation formula
changed. The protected renderer JS hash is updated for this audited call-site
change; all other baseline hashes are preserved.
