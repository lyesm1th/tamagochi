# Stage 6: separate belongings action text from scene previews

`belongingsChoiceContent` builds messages for opening belongings,
repairing, replacing and decorating them, while the app retains photo
scene rendering and event handling. No item price, wear percentage,
bed energy calculation, storage state or fallback string was changed.

The helper signals whether the existing decorated preview should be
drawn; the same call is performed in the app. Tests cover the first
selection, empty inventory, repair/replacement pricing, storage status,
bed bonus and optional photo previews.
