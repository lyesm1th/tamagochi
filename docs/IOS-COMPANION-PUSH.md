# iPhone companion: installation and push notifications

This is the same pet stored in the Telegram game, not a second save.

## iPhone (iOS 16.4 or newer)

1. In the **Telegram Mini App**, press **📱 Підключити віджет iPhone**. Copy the full `https://origin|ownerId.secret` line privately.
2. **In Safari**, open `https://<your existing Worker domain>/companion.html` (not the GitHub source-code link).
3. Safari Share → **Add to Home Screen**. Start the installed **РАААРРРАГОЧІ** icon.
4. Paste the Telegram pairing code once. The full state and actions `feed/clean/pet/sleep` use the same Durable Object.
5. Tap **🔔 Увімкнути сповіщення**, grant iOS permission, then **Надіслати тест**. A notification should appear; tapping it opens the mobile pet.
6. Notification preferences are independent of the Telegram bot. The same under-70 need scheduling is used: random 10–40-minute delay, maximum 3 per day, at least 3 hours apart, silent 23:00–09:00 in Europe/Kyiv.

## Engineering and privacy notes

- iOS Web Push requires a home-screen web app, a Service Worker, a user gesture to ask permission, a browser push subscription, and a VAPID-encrypted server push. No Apple developer account is necessary.
- The existing Cloudflare Durable Object securely generates and stores a unique private P-256 VAPID signing key per player. The private key is never sent to the browser or checked into Git. One active subscription per paired pet is supported.
- All push management routes require the same rotating secret paired in Telegram. Subscriptions are revoked on a new pairing or opt-out. Browser push endpoints are validated against permitted push-host allowlists to prevent SSRF.
- The `/companion.html` PWA is not a native WidgetKit home-screen widget and **does not create Dynamic Island Live Activities**. It provides a standalone interactive experience and lock-screen notifications.
- Deployment needs the Cloudflare Worker serving current `main`. GitHub CI being green does not itself confirm production deployment. Never paste pairing tokens in an issue, PR, screenshot, or chat.
