# Character and emotions

The existing trait and every existing save field remain intact. Six deterministic character axes extend the trait without changing it: affection, independence, curiosity, playfulness, sensitivity and stubbornness. No database migration, secret change or wallet change is required.

Fourteen named states: calm, content, sad, hurt, anxious, annoyed, angry, amused, bored, shy, grateful, curious, surprised, proud. An event stores its reason, strength and wall-clock expiry. The last 20 seconds fade; reopening the app does not restart a reaction. Low health, mood and hunger supply restrained fallback expressions. Sleep, eggs, vacation and death suppress expressions.

Care, food preferences, repetition, purchases, repairs, room touches and toy successes supply causes. Repetition thresholds depend on affection, independence and playfulness; sensitivity sets duration. Refusals apply only to optional repeated interactions, are limited to one per two minutes and never charge coins. Necessary care bypasses this gate. Existing action validation still applies.

The status action displays the character combination and current emotional reason. Calm activity scheduling is unchanged. Brief emotional movement transforms the dressed pet as a whole. Face anchors follow species, age and style; tears no longer use room coordinates. Motion reduction suppresses tears and movement.

## Validation

209 tests pass, including expiry/reload, stable legacy character, refusal recovery, care access, coin preservation and eye coordinates. `npm run build` checks the bundled app and linked assets. `docs/detailed-preview/emotions-check.mjs` renders twelve real local game scenes in both styles with clothing and multiple species/ages, without production requests. Scene images are in `docs/detailed-preview/emotions-check/`.

Preview scenes deliberately inject saved emotions to make review repeatable. They are not concept drawings. The detailed expressions are composited into the existing artwork; anatomy should still be reviewed on phones, especially with glasses and headwear. The extra states share some facial components; this is the first integrated visual pass rather than fourteen entirely separate sprite atlases.

No push to main or production deployment is part of this branch.
