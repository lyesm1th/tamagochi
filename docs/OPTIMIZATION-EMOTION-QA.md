# QA-only legacy emotion sprite runtime

The historical atlas-based expression renderer was not part of the live
application's dependency graph. It was loaded only by `animation-qa.mjs`
and `sprite-qa.mjs` during browser previews.

The module has moved from `public/emotion-sprites.js` to
`docs/detailed-preview/qa-emotion-sprites.js`. Both browser QA scripts
intercept the local URL `/__qa__/emotion-sprites.js` and serve that file
from the repository's docs directory, with its imports anchored to existing
public modules.

This does **not** remove or alter production emotion logic, detailed graphics,
pixel atlases, player data, clothing, or current renderers.

Run `npm test`, `npm run build`, and `npm run check:visual-baseline`
before merging. The Playwright-based visual QA scripts are not part of the
default CI suite, so execute them separately when Playwright is available.
