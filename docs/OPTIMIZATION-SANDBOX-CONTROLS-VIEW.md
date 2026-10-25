# Stage 6: sandbox DOM controls separated from app.js

The sandbox control model was already pure in sandbox-control-model.js.
This change extracts only the DOM button generation to
`public/sandbox-controls-view.js`. The app still owns the mutable choice,
current busy state, Telegram availability, audio unlock, rendering and API
dispatch. Event handlers are injected and retain their existing guards.

Button order, exact Ukrainian labels, action icons, selected classes,
aria-pressed/aria-label attributes, disabled rules and gameplay behavior
are preserved. When sandbox is hidden, it keeps the old children untouched.
Regression tests exercise the renderer with a tiny in-memory DOM.

No art, pet animation, saved data, network protocol or gameplay timings changed.
