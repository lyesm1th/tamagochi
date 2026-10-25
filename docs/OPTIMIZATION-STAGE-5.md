# Stage 5: wardrobe loading, safe first pass

Concurrent calls to `loadWardrobeAssets()` using the built-in browser loader
now reuse a single in-flight Promise for the same set of source files.

The Promise is released after success or failure: a later request can refresh
assets and a failed network request can be retried. Calls with injected QA
loaders remain independent to preserve their existing behavior.

No source image, sprite placement, color, wardrobe anatomy, clothes choice,
cache keys, saved data or player behavior has been changed.
