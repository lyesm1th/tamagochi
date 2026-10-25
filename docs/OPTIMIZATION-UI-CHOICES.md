# Stage 6: extract UI option preparation

The browser entry point now delegates daily-item counting, meal-option
cross products, and belongings selection lists to pure `ui-choices.js`
helpers. Existing wrappers keep state access and all call sites unchanged.

Exact original expressions are preserved inside the helpers, including
minimum counts, dish-major ordering, selected-item filtering and Ukrainian
action labels. Regression tests cover empty lists, different modes and
fallbacks. No graphics, saves, state mutations, API, or wardrobe changed.
