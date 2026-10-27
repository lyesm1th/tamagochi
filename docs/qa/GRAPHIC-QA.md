# Graphic QA 1.0

Private lab: `/lab.html`, authorized through the existing signed owner Telegram session. No changes to production access rules, player saves, prices, or pet artwork. Local browser automation intercepts transport in the test process only; it does not enable an application bypass.

## Run

Node.js 22+:

```sh
npm ci
npm run build
npm test
npm run check:visual-baseline
npx playwright install --with-deps chromium
npm run test:graphic-qa
```

The runner uses `CHROMIUM_EXECUTABLE_PATH` when supplied, then `/usr/bin/chromium` if installed, otherwise Playwright's installed Chromium. In the prepared cloud machine system Chromium is already available. Browser evidence is in ignored `tmp/graphic-qa/`; CI uploads it as `graphic-qa-browser`. Its report records the actual browser version.

The existing `npm run visual:matrix` remains the full wardrobe contact-sheet generator. Its detailed sheets now call the runtime portrait renderer, including repaired adult silhouettes and age scaling, instead of a second wardrobe compositor that clipped several new species. Its optional output directory can be supplied by invoking `node scripts/render-visual-evolution-matrix.mjs tmp/visual-evolution`.

## Controls and evidence

The existing lab now includes furniture, action, design, intact/broken/stored state, three layouts, playback speed, coordinates, layer order, bounds, and a saved-frame pixel difference. Reduced motion initially follows the device preference. Paused frames redraw when a control changes, rather than every animation tick. Reference captures are held in memory and cannot touch a player save.

Browser checks render all 14 species at all six ages, verify stage diversity and deterministic seeking, compare three body outfits on every adult species, and exercise approach/action plus unavailable furniture states across 224 species/item combinations. Output includes 84 individual Canvas PNGs, two species/stage sheets, a mobile lab capture and a frame difference. These are review evidence, **not newly user-approved screenshot goldens**. The checked-in approved source-file baseline is still enforced before the browser run. No command here automatically updates it.

## Reviewed correction

Starting point: main `cd127d794d999ddd27bc0503977c67272389f56b` (PR #76). Local Git history for PRs #69–76 was inspected. Initial GitHub API access was denied; access later recovered and PR #77 was created.

The prior detailed room draw tested purchase ownership directly and ignored storage. Interactions already used `roomOwned`, so unit tests could pass while players still saw stored furniture. Sleeping and hiding also selected stored furniture. The fix uses the existing ownership resolver consistently, including the box and loose toy, and refuses sleeping/hiding placement on broken furniture.

`tests/detailed-storage-render.test.js` compares actual rendered RGBA data for stored versus absent versions of 15 objects, plus sleeping and hiding states. It failed before the correction and passes afterward. Before/after images were inspected: the stored bed disappears and the sleeping pet rests on the floor. The only intentionally revised source baseline entry is `public/detailed-renderer.js`; atlas, wardrobe and dinosaur teen art hashes remain unchanged.

The startup test now gives sprite caches a real Canvas, so it validates the freshly built client instead of depending on the older checked-in bundle's narrower API use.

## Remaining review scope

This package establishes executable QA and fixes storage rendering. It does not claim every requested animation was redesigned. Source hashes and deterministic repeats do not substitute for approved browser screenshot goldens. New approval of such goldens, comprehensive motion/contact review, and validation inside the real Telegram WebView remain separate work. The historical `docs/detailed-preview/browser-check.mjs` currently stops at the obsolete `ПОГЛАДИТИ` menu label; it is not counted as a passing check. No production deployment is performed by these commands.
