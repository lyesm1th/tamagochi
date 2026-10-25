# Stage 6: companion choice content extraction

`companionChoiceContent()` prepares text for food, memory, room,
routine, adventure and family-tree pages. The existing app still owns
UI changes and room-art drawing for both graphics modes.

No food preference calculation, stage selection, currency, routine
time formatting, adventure branch, family tree or saved data changes.
Unknown modes remain no-ops. Regression tests cover the six modes,
owned/unowned objects, optional memories and ancestry.

The illustrated pet face, sprites, wardrobe and room placement are untouched.
