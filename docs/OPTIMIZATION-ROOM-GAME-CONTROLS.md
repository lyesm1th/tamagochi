# Stage 6: room mini-game button view model

Extracted room mini-game button preparation into `room-game-controls.js`.
The component still renders buttons, handles audio unlock, busy state, and
requests exactly as before. The new pure helper only prepares labels, active
states and request payloads from a supplied clock snapshot.

Room game order, session expiry comparisons, stop/clean availability, and
Ukrainian button text are preserved. No game logic, graphics, saves or
API routes were modified. Regression tests cover expiry boundaries.
