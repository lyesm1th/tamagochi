# РААААРРРАГОЧІ for free iOS widget containers

## First free route: Scriptable
Install [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) (free base). Copy `integrations/scriptable/RAAARRRAGOCHI.js` into a new Scriptable script, save it, add Scriptable as a Home Screen widget and select this script.

Widget parameter: `dino`, `cat`, or `pig|baby` etc. Supported original species IDs: chicken, cat, corgi, frog, bear, dog (cow!), dino, bunny, pig, sheep, fox, monkey, duck, penguin.

Initial prototype deliberately displays **only existing original pixel atlas images**. The first eight pets use the approved teen reference atlas; newer six support age atlas selection. No fake hunger, coins, or sync are displayed. Cached images continue to work offline after first successful load. Images are pinned to a reviewed source commit, rather than an unreviewed future experiment.

## Important limitations
- Scriptable is a third-party widget container, not an iOS app belonging to this repository.
- The widget is **read-only** and does not yet authenticate to the current Telegram-only API. The saved pet's name, age, clothing and stats are not synchronized in v0.1.
- iOS controls refresh scheduling; `refreshAfterDate` is a preference, not a guarantee.
- No generic Scriptable JS script can activate Dynamic Island Live Activities. A separate host app must explicitly expose ActivityKit templates and mechanisms.
- No App Store subscription is needed for this prototype.

## Next
Add secure pairing and an authenticated compact state endpoint, then adapt the widget to display the real saved pet and precomposed wardrobe sprite frames (without a second saved game). Keep Dynamic Island feasibility independent.
