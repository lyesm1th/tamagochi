# Stage 6: independent scene presentation selectors

The in-app style enumeration and the coordinates passed to room actions
have been extracted to pure `public/ui-scene-data.js` helpers.

Both expressions retain their original ordering and nullish fallback semantics:
0 is still a valid x/feet value. App wrappers and all callers remain in place.
Unit tests compare the old expressions against the new module for real styles,
empty styles and multiple scene snapshots. No art, animation formulas, saves,
room interaction coordinates, wardrobe or API contracts were altered.
