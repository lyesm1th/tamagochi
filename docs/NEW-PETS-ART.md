# Six new species and clearer growth

The game now has 14 species: the previous eight plus pig, sheep, fox, monkey, duck and penguin. Existing species IDs and saved pets are preserved.

## Art assets

The final production assets are `public/art/detailed/new-{babies,children,teens,adults,sleep,happy,eating}.<sha256-12>.webp`, referenced by `public/detailed-art-manifest.js`. Each sheet has six 192×192 cells. The existing seven atlases are unchanged. New sprites share the existing renderer, alpha cleanup, fitted wardrobe, scene position and depth scaling.

Artwork was produced with the built-in ImageGen tool, followed by deterministic grid slicing and nearest-neighbour import into the project. Original generated images remain preserved. No CLI/API fallback was used.

## Prompt set

1. Production transparent sprite atlas, exact uniform grid of five columns by seven rows. Columns: pink piglet with snout and curled tail; cream fluffy sheep with brown face; orange fox with white cheeks and white-tipped tail; brown monkey with peach face, large round ears and curled tail; yellow duck with orange bill and webbed feet. Rows: baby, toddler, teenager, adult, curled sleeping, delighted smiling adult, eating pose without food. Front-facing seated full-body chibi characters, dark outlines, pastel limited palette, glossy eyes, blush, chunky detailed cozy handheld pixel art. Babies have larger heads and smaller bodies. Every sprite has transparent margins; no props, clothes, scenery, shadows, text or watermark. Uniform cells are essential for slicing.
2. Edit only the fourth adult row: open shiny eyes and gentle awake smiles. Keep the fifth row sleeping with closed eyes, preserve other rows, positions, dimensions, identity and transparent grid. Remove extraneous pure red/green edge specks.
3. Extend the reference to six columns by seven rows by adding a penguin on the right. Preserve the first five columns. Penguin: black back/head, white face and belly, tiny orange triangular bill, webbed orange feet, short flippers; gray fluffy baby, toddler, teen with juvenile patches, awake adult, curled sleeping, delighted adult, eating pose with flippers near bill and no food. Match the same pixel style and transparent margins. Adult eyes open; sleeping eyes closed; no clothes, props, text, backgrounds or edge specks.

## Rendering changes

Baby height is 40% of adult height, child 64%, teenager 84%; the baby is rounder, the child wider and the teenager slimmer. Senior sprites are slightly smaller and more gray. Classic sprites and clothing use matching stage transforms. The gameplay age durations are unchanged.

## QA

- `docs/detailed-preview/new-pets-check.mjs`: renders all six species through egg, baby, child, teen, adult and senior stages in the real room renderer and renders a shared playground scene.
- `docs/detailed-preview/wardrobe-check.mjs`: 448 combinations across 14 species, eight garments and four growing stages, including pixel alpha tests for attached clothing.
- `tests/new-species.test.js`: voice, food, favorite food, bowl, recipes, inheritance and sandbox acceptance.
- `tests/wallet-runtime.test.js`: authenticated adoption, feeding and shared sandbox entry through actual Workers/SQLite for all six new species.
