# Mobile widgets: zero-cost, 2D-only implementation

This effort extends the existing Telegram pet, not a separate game. Use the committed detailed 2D atlases, age assets, and wardrobe renderer. Do not import experimental 2.5D/3D lab modules.

## Storage and compatibility
Production state is in SQLite-backed Cloudflare Durable Object `PetRoom` (binding `PETS`), not D1 in the current wrangler configuration. Do not migrate existing pet records. Preserve species ID `dog` for the cow.

`public/mobile-pet-snapshot.js` is a pure, read-only state projection shared by potential mobile API and local preview tools. It intentionally does not run `tick`, `visit`, `petInitiative`, write storage, or grant rewards. It is **not** an authenticated public endpoint.

## Delivery order
1. Export approved detailed 2D sprite/wardrobe assets for native use; add visual baseline tests for all 14 pets.
2. Add secure one-time Telegram-linked native device pairing and revocable sessions on an isolated API path. Preserve existing Telegram initData auth for all existing routes.
3. Expose a minimal authenticated native snapshot using the pure projection, with cache/version and rate limits.
4. Build Android native widget first, then WallpaperService and opt-in overlay. No continuous network animation.
5. Build iOS WidgetKit and ActivityKit limited to actual ongoing in-game activities. Push-to-start requires device/APNs credentials, appropriate capabilities and actual activity justification.

## Money
No paid services or infrastructure for development. Apple Xcode local device builds can be free, but public App Store/TestFlight distribution normally requires a paid Apple Developer Program membership. Do not enable or promise paid distribution at zero budget.

## Safety
No production migration, no hardcoded secrets, no new wallet logic. Keep mobile work in a feature branch; merge only with tests and visual review.
