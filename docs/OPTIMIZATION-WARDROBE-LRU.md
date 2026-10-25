# Stage 5: hot-wardrobe canvas cache

The existing assembled-outfit Map had 128 entries but evicted the oldest
*created* combination. Active outfits could be evicted when opening many
other combinations.

The same 128-entry cache is now LRU: a cache hit refreshes the entry's
recency. The pixel canvas is not regenerated on a cache hit, and the same
object is reused. Keys, painting methods, order of clothing layers, source
assets, coordinates and saved data are unchanged.

The protected renderer source checksum is updated with this intentional
logic-only review. All other visual baseline file hashes stay identical.
