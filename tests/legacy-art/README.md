# Legacy experimental wardrobe, tests only

This directory contains the obsolete `fitted-clothes` / `tailored-wardrobe`
implementation retained only for comparison/integrity tests. It is not
imported by the live classic or detailed renderer.

The production wardrobe remains unchanged in:
- `public/authored-wardrobe.js`
- `public/detailed-wardrobe.js`
- `public/cozy-effects.js`

Do not import these legacy modules into production. Do not delete them
until their QA coverage has been replaced by tests of the active wardrobe.
