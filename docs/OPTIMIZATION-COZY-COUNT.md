# Stage 6: side-effect-free cozy menu counts

Moved the six-mode `cozyCount` decision table to `countCozyOptions` in
`ui-choices.js`. The wrapper supplies a single current-time snapshot and
existing callbacks. Order, fallback counts, boundaries and conditions are
unchanged. Tests cover expiration boundary behavior, empty lists and branches
that must not call unrelated providers.

No DOM, graphics, saves or API paths changed.
