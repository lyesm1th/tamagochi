# Stage 3: emotion priority extraction

The source of truth remains `emotionOf()` in `public/emotions.js`.
Its fallback priority has been extracted to `needEmotion()` without
changing thresholds or priority:

1. Dead/sleeping/napping/vacation: calm (no emotion)
2. Farewell preview: sad
3. Valid active saved emotional episode
4. Health below 35: anxious
5. Happiness below 35: sad
6. Hunger below 25: annoyed
7. Recent skill achievement: proud
8. Calm

The extraction adds regression tests for saved episodes, boundary conditions,
load/reload, sleep, farewell, and priority ordering. No rendering files, pixel
data, wardrobe geometry, network/API contracts or persisted fields change.
