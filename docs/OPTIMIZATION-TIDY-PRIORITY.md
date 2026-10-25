# Stage 4: auto-tidying guard order

Automatic tidying must not run during manual room activity, unavailable
life stages, sleep, vacation, or other incompatible actions.

In `updateEnrichment`, the existing eligibility tests now run before
the background `ambientSlot` calculation. This avoids doing that
calculation for actions that cannot occur. The logical AND condition and
its thresholds are unchanged, so the successful tidy slot, animation
and saved state remain exactly the same.

Automated tests cover room-lane selection and absence of tidying during
manual sessions and excluded states. Sprite art, wardrobe and saves
were not modified.
