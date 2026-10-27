# PIXEL 2.5D LAB (experimental, owner-only)

This work extends the existing /lab.html Graphic QA and is intentionally not enabled as a third player graphics setting.

## Current architecture
- Existing Detailed renderer is the canonical appearance reference.
- The new WebGL canvas composes actual Detailed room and portrait rasters using NEAREST texture sampling and orthographic image-space projection. It is NOT a GLB mesh, skinning system or production Three.js renderer.
- The experimental image-space head hinge is sourced from the existing wardrobe anatomy for every current species and life stage. It can produce seams and cannot reveal unseen side/back geometry. Rig guides show approximate joint coordinates, not verified anatomical masks.
- The original Canvas scene, timeline, species, age, clothing, furniture controls, and screenshot pixel-diff system remain available.
- Seven workspace tabs organize controls in the SAME room. They do not duplicate the save, economy, or game APIs.
- PNG export of the WebGL surface is a local browser download.

## Security and isolation
Worker gates every /lab* asset using a signed Telegram owner session. Do not weaken it when adding new lab modules. Every test pet comes from labPet(), never from player storage. Never enable the Pixel 2.5D mode through graphics-mode.js before separate approval.

## Known limitations / next engineering steps
1. Extract opaque head/torso/limb masks from authored sprites without losing pixels, then generate per-species visual atlases with regression checks. No automatic crop can recover hidden angles.
2. Build per-species articulated 2.5D rigs with front/quarter/side authored assets, pivot calibration and independent attachments. Validate all ages and garments.
3. Add true room-depth sorting, occluders, collision/contact points and room furniture scene graph, preserving existing ownership and condition policy.
4. Wire animation timeline to the 2.5D pose controller and add snapshot goldens for WebGL plus Telegram WebView tests.
5. Measure frame time and memory on budget Android Telegram WebView before considering a production third graphics option.

Do not merge PR #80 or deploy on the basis of static integration tests alone. PR #77 changes are a prerequisite, not a reason to merge them automatically.
