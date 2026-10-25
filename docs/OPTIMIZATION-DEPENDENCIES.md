# Module cleanup: verified dependency classes

Do **not** remove candidates automatically. Browser HTML scripts, dynamic
imports, test utilities, and asset/tooling references must be accounted for.

The audit now includes `public/index.html` and `public/lab.html` as runtime
roots. In particular, `owner-lab-entry.js` is live production code from HTML,
**not** an orphan module. The owner-only laboratory and server authorization
must be preserved.

The separate `emotion-sprites.js`, `fitted-clothes.js`,
`tailored-wardrobe.js` and `emotion-sprite-manifest.js` have QA/test or
generation references. They cannot safely be deleted on the basis of
runtime-import reachability alone.

Only remove a module after confirming no callers in application HTML,
generated bundles, tests, build scripts, QA tools and dynamic asset loads.
All 58 original visual files remain pinned by the visual baseline.
