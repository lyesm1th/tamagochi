# Identity-preserving wardrobe and emotions — review build

The dinosaur screenshot approved in the conversation is the style reference. Original species, faces and age proportions remain the source artwork. This branch is for visual review before updating main.

## What the game renders

- Three independently illustrated garment designs: lavender pajamas with cream collar/cuffs, burgundy ribbed knit sweater, golden rain jacket with collar/pockets/buttons. Each has a species-specific cut in four growth stages plus the original curled sleeping pose: 210 authored garment/pose variants.
- `authored-wardrobe.js` builds one complete actor bitmap from the original animal, the pixel-aligned authored fabric, neck accessory and headwear. Room movement, portraits, sandbox and games draw that same bitmap. Nothing is attached to room coordinates, and fabric is opaque.
- Hat art uses the original illustrated wardrobe assets, seated relative to each species' eyes and skull. Original ears, horns, wool and crests remain in front through apertures. The original face is restored below the brim. Hats/glasses are removed for sleep; hats are drawn beside the bed.
- Existing wardrobe slots already prevent equipping two items in the same slot. No inventory, ownership or saved outfit format changes.
- Complete garment artwork is packed as sparse, lossless, hash-versioned patches to avoid downloading each unchanged pet three times. At runtime the patches are baked into the full actor before it is drawn. Packed cloth totals about 1.1 MB instead of 6.1 MB for duplicate full sprites.

## Expressions

`pet-expression.js` moves the existing source eye/highlight/mouth pixels with a local nearest-neighbour deformation; it never paints replacement eyes or a replacement mouth. Laughter gently opens the original mouth, blinking compresses the original eyes, and small poses distinguish sadness, anger, annoyance, curiosity, boredom and the other existing states. Tears collect at measured lower eyelids and descend on the cheek. There is an initial short gesture and a long quiet hold; reduced motion disables blinks, shaking and falling tears. Emotional intensity rises over 700 ms and uses the existing final 20-second fade.

Original classic graphics use their own source artwork and native pixel garments. Faces retain their original drawing, with their existing blink shape. The old replacement-expression atlases remain historical files and are not imported by the live detailed renderer.

The existing need/personality/event/repetition mechanics and bounded refusals remain in place. Seventy additional species-specific lines cover sadness, laughter, anger, annoyance and boredom; the existing shared emotional dialogue remains available. No extra speech timer or sound frequency was introduced.

## Source repairs

Several extended adult source cells were cropped at the bottom. Their feet are completed using the same species' original child feet, while the original adult head and face are retained. These originals also render correctly without clothes. A neighbouring fragment on the sleeping cat and a thin unrelated strip beside the monkey are removed. These repairs are independent of emotional state.

## Art preparation

The built-in imagegen skill/tool was used for fabric artwork, not for the final face. Prompt set: edit the original four-by-four transparent reference atlas in place, preserve every animal/age/pose/head/face, add a fitted short-sleeve garment with bare hands/paws/wing tips in front, leave lower belly/feet/tails visible, keep the two unused cells empty, no hats/background/text/artifacts. Garment design descriptions are the three designs above. Sleeping prompts additionally require the original curled pose and fabric only on visible shoulders/back/cuffs. Generated face changes and stray background pixels are discarded during compilation.

Offline preparation scripts are in `scripts/artwork/`. They write intermediates under ignored `tmp/visual-repair/`. Order: extract originals, prepare reference sheets, extract sleeping references, repair cropped adult feet, measure landmarks, compile each garment atlas, compile each sleeping garment, pack patches. `SHIRT_BABIES`, `SHIRT_CHILDREN`, `SHIRT_TEENS`, `SHIRT_ADULTS`, `GARMENT` and `SLEEP_ART` select authored input images. New generated input always requires visual review. The committed lossless patches and source manifests are the production art inputs; normal builds do not run image generation or these offline preparation scripts.

## Validation and review

`tests/authored-actors.test.js` exercises the live outfit loader and compositor. It checks original face pixels in 1,008 species/age/body/neck/hat combinations, checks that blink/laughter frames use the original actor palette, and checks that tears begin below the original eyes. These checks protect invariants; they do not establish artistic quality.

`docs/detailed-preview/identity-check.mjs`, `classic-identity-check.mjs` and `record-identity.mjs` use the actual renderer with local fixture states and abort all external requests. Review artifacts are in `docs/detailed-preview/identity-check/`; the movie contains a 12-second sequence including the quiet hold. No production player state is used or modified.

No Worker configuration, secrets, Durable Object storage, migrations, economy or gameplay saves are modified. Main remains unchanged until the in-room visual result is reviewed.
