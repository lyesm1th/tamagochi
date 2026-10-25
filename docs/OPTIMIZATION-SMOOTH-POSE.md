# Stage 6: extract deterministic pet pose smoothing

Moved the in-app smoothing interpolation to `public/smooth-pose.js`,
which has no DOM or game-state access. The wrapper maintains the existing
`smoothScene` state and receives the resulting scene and pose.

The original frame interpolation rates (700ms and 1200ms for sleepy mood),
clamping, object mutations, reset behavior and target identity are
unchanged. Frame-by-frame tests compare the extracted algorithm to the
original reference over thousands of simulated milliseconds.

No sprite, graphic, outfit, backend or save format changed.
