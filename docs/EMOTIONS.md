> Current visual implementation: [GRAPHICS-IDENTITY.md](GRAPHICS-IDENTITY.md). Original face pixels are animated without replacement expression atlases.

# Current visual policy

Replacement eyes and mouths are disabled following in-game review. See [FIT-REPAIR.md](FIT-REPAIR.md) for the original-face and tailored-outfit implementation. The expression-atlas section below documents the superseded prototype; its images are not loaded or drawn by the live renderer.

# Character, expression sprites and wardrobe

The five existing traits remain intact. Six stable axes extend them: affection, independence, curiosity, playfulness, sensitivity and stubbornness. Fourteen emotion states (including calm) retain their cause, intensity and wall-clock expiry; the last 20 seconds gradually settle. Care, food preferences, repetition, room updates, repairs and touch/toy events supply causes. Necessary care bypasses the bounded optional-interaction refusal gate. The status action explains the current state; 42 contextual lines are selected once per episode. Calm activity scheduling stays in place.

## Expression art

`npm run build:sprites` reproduces 14 transparent, lossless WebP atlases from the original isolated art. Each has four ages, 13 expressive states and four authored frames: 2,912 frames total. Senior pets reuse adult geometry with the established senior tint. Landmarks are measured on each species/age sprite and refined against the source pupils. Face feature masks are filled only from the sprite's own texture, then eyes, brows, nose/mouth, blush and tears are drawn on an integer pixel grid. The original alpha silhouette is restored exactly. Cells have transparent gutters. No screen or room pixels enter the expression sprite.

At runtime, the selected face frame is composed onto an offscreen naked sprite; clothes are added afterwards. Scene transforms move the complete dressed sprite. The brief opening reaction settles into a long hold, with a small expression cycle at most once per 12 seconds. Reduced motion holds the first frame and suppresses movement. Sleep, eggs and death keep their dedicated existing art.

## Clothing

The sweater, raincoat and pajamas use opaque fabric polygons with closed sleeves/cuffs, stitched collars, hems, patterns and pockets. Fur luminance no longer supplies their colours. No rectangular paw regions are copied back over a garment. The scarf and bow are opaque and follow the neckline. Glasses use a pixel frame and transparent lenses positioned at the actual eyes. Headwear keeps the established isolated atlas assets.

Four body choices (including bare), three neck choices, three head choices and two eye choices yield 72 combinations per species/age. Each requested combination and expression is baked into a separate complete sprite and cached; duplicate files for the full cross-product are unnecessary. The bounded dressed-sprite cache contains 128 entries and the expression loader holds two species atlases. A cached completed sprite survives atlas eviction. Failed downloads back off before retrying. The original style draws expressions directly into its procedural pet before opaque clothes and scene movement.

The extended-species cleanup also removes thin detached edge fragments (including the observed strip beside the monkey). Furniture, props and clothing icons were inspected on alternating light/dark backgrounds.

## Validation and review artifacts

- 212 tests pass, including all 2,912 frames' source-alpha equality, transparent gutters and clean RGB; 504 fabric variants preserve alpha and use fully opaque changed pixels.
- Browser QA renders 4,032 full outfit combinations and 2,912 expression frames with no partial-alpha pixels or JavaScript errors. This checks the two sets separately, not their complete cross-product.
- Four age contact sheets, a 72-combination cat wardrobe sheet, twelve real device/room scenes and six animated room sequences are under `docs/detailed-preview/`.
- `npm run build` passes client bundling and linked-asset checks.

To regenerate review files, run `sprite-qa.mjs`, `animation-qa.mjs` and `emotions-check.mjs` in `docs/detailed-preview/` with Playwright available (`PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE_PATH` may select a local installation), then `node scripts/package-sprite-previews.mjs`. The isolated local preview context blocks non-local requests and never touches production saves.

All save additions are optional/backwards-compatible. Wallet, gift codes, secrets, Durable Object migrations and production configuration are unchanged. Build-time art tooling is in devDependencies; shipped assets require no image-generation service.
