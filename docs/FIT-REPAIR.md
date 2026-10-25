> Historical repair attempt, superseded by [GRAPHICS-IDENTITY.md](GRAPHICS-IDENTITY.md). Its procedural fabric and fixed expression policy are no longer the live implementation.

# Original face and fitted wardrobe repair

The replacement expression atlases changed the identity of the eyes/mouth, and fading them over the base produced ghost features. They are now disabled in both graphics modes. Emotion causes, text and whole-body gestures remain; the original illustrated face is used unchanged. Care effects animate props and the complete pet rather than switching the adult body to a differently proportioned happy/eating sheet.

Detailed outfits are tailored to the actual eye spacing, body centre, neck and hem of each species/age form. The fabric follows a curved torso profile with discrete highlights/side shadows, joined sleeves and curved hem. Original curved forepaws occlude the cloth instead of the shirt crossing in front of them. Neck accessories follow a narrow neckline. The tail stays outside the torso cut.

Headwear is seated against the actual opaque cranium between ears/crests. Its curved band wraps the forehead and ear tips remain in front of the crown. It is not a resized shop thumbnail. Protected eye pixels are never covered or altered by the hat renderer.

The earlier alpha-only tests did not establish correct fit or facial style. New regression tests compare original eye/mouth RGBA values in 504 dressed cases covering 56 species/age forms. Browser review renders all 56 forms with bare/body/head combinations and checks that thirteen emotion states reuse the exact same complete sprite as the neutral face. Six actual room scenes include the reported dinosaur with pajamas and hat. See `docs/detailed-preview/tailor-check/`.

No secrets, migrations, wallet logic or player progress are changed. The expression image files remain as unused historical assets; the live renderer does not load or draw them.
