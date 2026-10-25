# Stage 6: split app.js safely, first extraction

Menu items, routine labels, root-group generation and group submenu
composition now live in the pure `public/menu-config.js` module.

The existing UI state, button navigation, selection reset, group filtering,
labels, icons and list order are kept identical. `app.js` retains all
side effects and only calls the extracted builders.

Regression tests compare every real group against the previous algorithm,
verify ordering and verify that the new module is DOM/storage independent.
No art, wardrobe, animation, API, permissions or save data changed.
