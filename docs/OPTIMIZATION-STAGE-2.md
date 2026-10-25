# Stage 2: conservative code cleanup

The optimization must **not alter runtime behaviour**, published pixels, garment
positions, player savings, game saves, account security, or data schemas.

## First audit findings

- `emotion-sprites.js` is **not in the main runtime dependency chain**, but
  `docs/detailed-preview/sprite-qa.mjs` imports it dynamically.
  `docs/detailed-preview/animation-qa.mjs` also uses it. **Do not delete.**
- `fitted-clothes.js` and `tailored-wardrobe.js` are not imported by the active
  detailed renderer, but are referenced by `tests/face-and-fit.test.js` and
  `tests/sprite-integrity.test.js`. **Do not delete without replacing their tests.**
- `emotion-sprite-manifest.js` and `emotion-frames.js` support animation
  generators and validation. **Do not delete them or their sprite atlases.**
- A source-level import search can miss string-based asset references, URL loads,
  entry points, test harnesses, and dynamic imports. No candidate may be removed
  solely because an import graph labels it unreachable.

## Guardrail

Run `npm run audit:modules` for a **non-destructive inventory**. For a removal,
first examine its full import graph and dynamic callers, then update or preserve
the relevant tests; only merge a removal after the complete CI pipeline passes.

## Safe scope for now

Only repository tooling and documentation are changed on this branch. No
runtime code, graphical assets or wardrobe geometry were modified.
