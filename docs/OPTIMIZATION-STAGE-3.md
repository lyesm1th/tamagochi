# Stage 2 completed: conservative cleanup

The existing stable state was backed up at `6868be1`. Stage 2 updates
were verified separately by CI before merging to `main`.

Completed scope:
- Isolated the obsolete prototype wardrobe under `tests/legacy-art/` and
  retained its integrity tests.
- Moved the retired atlas emotion painter into developer-only visual QA.
- Fixed module auditing to recognize HTML entrypoints such as the owner lab.
- Removed redundant import/re-export dependencies for lifecycle and weather.
- Reused shared time constants in world and companion systems.
- Kept the current detailed and classic renderers, pixel assets, wardrobe
  positions, player data and storage schema unchanged.

Deferred intentionally:
- Deleting old emotion atlas assets: several generator/integrity tests still
  need them.
- Removing QA tools or old art references without adequate replacements.
- Changing sprite expression warping or posture.

# Stage 3 started: centralized emotion catalog

`emotionNames` in `public/emotions.js` is authoritative. The list of animated
emotions in `public/emotion-frames.js` derives from it, excluding calm.
The historical ordering and expression recipe behavior are guarded by tests.

This commit does not modify the gameplay state schema, animation formulas,
rendering coordinates, clothing or any authored art.
