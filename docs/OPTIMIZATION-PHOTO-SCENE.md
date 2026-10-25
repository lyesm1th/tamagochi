# Stage 6: photo scene isolation

Moved the photo album scene renderer into `public/photo-scene.js`.
The app injects the existing drawing callbacks and canvas creation.
Classic canvas dimensions, layer sizes and exact draw order/coordinates
are unchanged; the detailed portrait call preserves every argument.

Tests record rendering calls in both modes and ensure the same helper is
used for preview and exported photos. No source graphics, wardrobe, save
format, player state or gameplay logic changed.
