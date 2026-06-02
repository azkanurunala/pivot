# assets

Drop the app artwork here (referenced by `app.json`):

- `icon.png` — 1024×1024, **no alpha channel** (App Store requirement).
  Generate/regenerate with a script, e.g. `node scripts/gen-icon.js`.
- `splash.png` (optional) — used by `expo-splash-screen` (contained on `#080B11`).

Until `icon.png` exists, `expo run:ios` will warn but still build; add it
before `eas build`/submit.
