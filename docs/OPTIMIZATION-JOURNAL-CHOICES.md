# Stage 6: journal choice text, pure extraction

The labels and descriptions for drawings, keepsakes, quirks, courage,
togetherness, and dreamgame now come from `journal-choice-content.js`.
The rendering call and DOM updates remain in `app.js`.

No dialogue wording, mode ordering, canvas, pet artwork, save schema,
movement timing or UI callbacks changed. The text function takes a
snapshot of the existing journal object and explicit reference data.
Unknown modes return null, preserving the previous no-op behavior.

Regression tests cover each page, alternate states and exact Ukrainian text.
