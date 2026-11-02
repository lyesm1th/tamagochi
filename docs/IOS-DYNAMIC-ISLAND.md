# iPhone Dynamic Island: opt-in native Live Activity bridge

**PWA alone does not create Dynamic Island.** This optional adapter uses the third-party iOS app PushWard (ActivityKit Live Activities) and the existing Cloudflare Worker. No Mac, Xcode, Apple Developer subscription or new game save is required.

## Set up using only an iPhone

1. Open PushWard from its [official App Store listing](https://apps.apple.com/us/app/pushward/id6759689999). Availability differs by country; verify the app is offered for your Apple ID before proceeding. PushWard currently requires iOS 26+.
2. Sign in with Apple in PushWard; allow Live Activities in iOS Settings for PushWard.
3. In PushWard settings, generate a **separate scoped key** with `activity:manage` scope. Do not paste the key in chat or screenshots.
4. Open the installed game PWA at `https://<your Cloudflare Worker>/companion.html`, paired with your real Telegram pet.
5. Under **🏝️ Чуча в Dynamic Island**, paste the `hlk_` integration key and tap **🐮 Показати Чучу**.
6. The Worker requests an actual PushWard Live Activity with an original pixel pet portrait, synced name, mood, hunger, cleanliness, sleeping visual, and Dynamic Island status.
7. Tap **↻ Оновити острівець** to manually refresh (rate-limited). Feed/clean/pet/sleep actions from Telegram or the PWA also request refreshes when the rate limit allows. **Прибрати з острова** ends the Live Activity and deletes the remote key from our pet's Durable Object.

## Limits and behavior

- iOS decides if/when Live Activities appear. They are **not permanent animated desktop pets**; Apple limits a Live Activity to up to 8 hours in Dynamic Island. This bridge does not yet schedule automatic disappear/reappear cycles.
- On free PushWard, **250 Live Activity updates/month**. The bridge enforces **at most 6 per UTC day and at least 30 minutes between automatic/manual updates**, not counting a manual reconnect. Excessive reconnects can still use the monthly quota.
- PushWard pulls `https://<Worker>/assets/island/<age-or-sleep>/<species>.png`, transparent sprites generated from the original game atlas by `scripts/build-island-art.mjs` at deploy time. It displays the correct sleeping sprite. The graphics remain classic 2D pixels, never AI-generated replacements or 3D.
- The app's built-in layout cannot provide fully free-form animation or full custom button placement in the Dynamic Island. This is a **native bridge to show the real pet** without distributing our own iOS app.
- The key exists only in the user's Durable Object storage. All management routes require the same signed widget pairing token. A new pairing disables the previous device and ends its activity. Do not share or commit API keys.
- The bridge makes server-to-server requests only to `https://api.pushward.app`. Cloudflare actions and game progress stay on the original Worker and Durable Object.
- GitHub CI proves code and image builds; **real iPhone/PushWard delivery must be tested manually**. Cloudflare deployment is separate from merging GitHub.

## Native care buttons (interactive Steps template)

The adapter now uses PushWard's `steps` Live Activity template. On iPhone, **touch and hold Dynamic Island** to expand it. The Lock Screen card also has action buttons. In the expanded view, **🍗 Годувати** and **❤️ Погладити** issue silent POST requests to the same Cloudflare pet Durable Object; the first action becomes **🧹 Прибрати** when cleanliness is critically low or **☀️ Розбудити** while the pet sleeps. Actions apply existing education, affection, mood, refusal and aging rules in `act()`. They are not fake client-side counters.

PushWard native webhook support is version-dependent. Update the iOS PushWard app to a release that supports `url_action` / `secondary_url_action` for `steps` in expanded Dynamic Island. If buttons do not render, verify the activity's API state and the installed PushWard version.

No Telegram token, web-app pairing token or PushWard provider key is included in the action content. The only embedded credential is a random per-pet care-only token, sent in `X-Pet-Care-Key` on each HTTP POST. It expires after 12 hours (and is rotated on server-side refresh) and is revoked on disconnect or new pairing. It cannot perform shop, wallet, admin, or Telegram operations. The server rate-limits rapid repeats to one care action per 8 seconds. Native actions update the pet immediately; PushWard artwork/status refresh is subject to the existing free-tier budget, so it may lag behind the saved state.

If you previously connected the generic Live Activity, tap **↻ Оновити острівець / 🛠️ Увімкнути кнопки** in the installed companion. The next provider PATCH upgrades it to `steps`, no second PushWard key is needed. Unpairing revokes both care buttons.
