# Optimization safety baseline (stage 1)

The production branch is `main`. The immutable recovery point is commit
`6868be1d4fd7f527e64db3352ce7422e759710f4` on branch
`backup/stable-before-optimization-2026-10-25`.

## Rules
- All optimization development happens on `optimization/*` branches.
- No runtime changes are permitted in stage 1. The visual appearance, body proportions,
  face, clothes, game rules, Durable Object schema, player money and saved data remain unchanged.
- Run `npm ci`, `npm run check:visual-baseline`, `npm test`, and `npm run build`.
- The baseline is a list of original Git blob SHA-1 IDs for art files and visual
  contracts. It intentionally blocks even tiny changes to original pixels,
  sprite positioning, the wardrobe system, and relevant renderers.
- Update baseline identifiers only in an intentionally reviewed visual redesign,
  separately from gameplay refactors.
- Source control checks alone do not prevent direct pushes to `main`.
  Enable GitHub branch protection/rulesets with required checks before relying
  on them as a deployment gate.
- Never alter stored player data or run migrations as part of maintenance-only cleanup.

## Revert
To recover stable behavior, create a normal revert commit restoring the tree from
`backup/stable-before-optimization-2026-10-25`, rather than force-pushing away history.
For an individual stage, revert only that stage's commit. Retest before merging.
