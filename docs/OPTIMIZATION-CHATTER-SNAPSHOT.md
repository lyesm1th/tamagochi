# Emotion snapshot now shared by automatic chatter

`pet-chatter.js` now resolves the emotion once using `emotionOf(pet,now)`,
then selects the sentence using `emotionLineFor(pet,emotion)`. The legacy
`emotionLine` wrapper remains intact for other callers.

The emotional snapshot is not persisted, and the speech schedule, slot
selection, thought cache, input guards, and all dialogue are unchanged.
Tests guard equivalence between the old wrapper and the new snapshot path,
as well as silence during sleep and critical needs.

No avatar geometry, art, wardrobe, server API or save format changed.
