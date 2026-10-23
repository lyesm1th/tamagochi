# Production art direction

Reference: the first detailed ХАМАГОЧІ board approved in conversation.
Generation: built-in ImageGen. The generated images are production atlas inputs;
review pictures in screenshots are captured from Chromium, not generated mockups.

Shared prompt: warm detailed 16-bit pixel art, visible square pixels, dark
muted-green outlines, sage/cream/lavender/peach/walnut palette, crisp anatomy,
no text/logos/UI in assets, transparent alpha for foreground sprites.

Character atlases: 4×2 grid in order cow, cat, chicken, frog, corgi, bear,
dinosaur, bunny. Distinct baby, child, teen and adult forms. Separate adult
sleeping, happy/affectionate and eating reactions. The cow's bow was removed
from the base sprite; all clothing is overlaid by the runtime.

Furniture atlas: 4×4. Wooden/lavender bed, peach bed, cloud/mint bed, bowl;
plant, rug, shelf, lamp; tent, cushion, fountain, mirror; play post, curtains,
toy chest, window. Empty room contains only wall and floor. Wear and breakage
are runtime transformations/debris, so the same object retains its identity.

Wardrobe atlas: 4×2. Panama, raincoat, pajamas, crown; scarf, bow, glasses,
sweater. No mannequins or background. Runtime anchors follow species and age.

Props atlas: 8×4. Milk, grain, cookie, hay, fish, meat, berries, carrot;
grass, apple, worm, algae, fly, kibble, leaf, water;
brush, sponge, bathtub, blanket, medicine, cooking pot, egg, poop;
heart, gift, ball, music box, angel, tombstone, wooden debris, stuffing.

Backgrounds: empty room, empty shared playground, forest and pond. Outdoor
scenes keep a clear foreground for separate pet sprites. Park walks use the
playground environment. Weather, night lighting, dreams, parties and needs
are rendered by code using the same colors and assets.

Delivery: fingerprinted WebP atlases and JS bundle. Original output references
are listed in asset-sources.json. No live user state is used in review captures.
