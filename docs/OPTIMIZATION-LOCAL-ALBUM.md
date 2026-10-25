# Stage 6: isolate local album persistence

Extracted the legacy offline album read/filter/write algorithms into
`public/local-album.js`. Browser storage, species, record builders and
error callback are injected; the app keeps the same wrappers and timing.

The key (`hamagochi-album`), legacy record filtering/order, use of
`record || snapshot(...)`, try/catch boundaries and Ukrainian storage
error message are unchanged. Existing saves and album records require no
migration. Added regression tests for malformed data and quota errors.
No graphics, gameplay, network API or wardrobe changes.
