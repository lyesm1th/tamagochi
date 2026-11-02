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
