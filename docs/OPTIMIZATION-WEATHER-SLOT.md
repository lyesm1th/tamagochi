# Stage 4: reuse weather ambient slots in journal speech

`ambient()` already knows the active slot. It now passes that slot to
`journalAmbient()` when selecting automatic weather moments.

`journalAmbient` also serves manual journal gestures and external callers.
Its optional third argument defaults to the previous behavior so those callers
and manual gesture priority are unchanged. The weather response wording,
eligibility, timing, and priority are unchanged.

Tests compare both paths over multiple weather transitions and verify
manual activity precedence. No graphical assets, movement coordinates,
save data, networking or wardrobe code changed.
