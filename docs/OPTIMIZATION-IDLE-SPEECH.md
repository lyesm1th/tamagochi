# Stage 6: isolate idle pet speech priority

Extracted the legacy `idleSpeech()` selection chain to `public/idle-speech.js`.
The app supplies exact existing callbacks, its online flag, wardrobe metadata,
and the browser clock/random functions without changing the call sites.

Order is preserved: introduction, vacation/sleep, wake story (offline save),
recent dream/removed outfit, bond and urgent needs, room/ambient/daily/
ritual reactions, routine, adventure, repeat need check and species defaults.

Time and randomness are requested lazily at the exact decision points.
No change to dialogue strings, probability thresholds, timings, animation,
pet visuals, game state, network API or save formats. Regression tests guard
priority and threshold boundaries.
