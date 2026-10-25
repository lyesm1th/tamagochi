# Stage 6: sandbox control view model

The sandbox buttons are still created and wired in `app.js`, but the
selected peer, the four labeled actions, custom game button data, and
enabled/disabled state are now calculated by `sandboxControlModel`.

The model is a pure function. Tests compare every combination of busy/online
flags, peer count and selected index against the original expressions.
Callback wiring, audio unlock, navigation and rendering remain in the app.

No change to pets, networking, saves, graphics, wardrobe or animations.
