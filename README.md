# StyleDNA CLOSET — MVP 1.0

A local-first digital wardrobe built with Next.js App Router, TypeScript, React, and Tailwind CSS 4. Warm neutrals, olive accents, editorial serif typography, and responsive desktop/mobile layouts.

## Run locally

Requires Node.js 22.18+ (validated with Node 24).

```sh
npm ci
npm run dev
```

Open the development server on port 3000. No environment variables, backend service, or API keys are required.

```sh
npm run typecheck
npm test
npm run build
npm run start
```

For the browser smoke test, keep a production server running on port 3000 and run `npm run test:e2e`. Chromium defaults to `/usr/bin/chromium`; set `CHROMIUM_PATH` to another installed Chromium executable if needed.

## Features

- Photo upload and drag/drop (JPEG, PNG, WebP, max 15 MB); images are resized to a maximum 1200px dimension.
- Add, edit, delete, search, filter, and favorite wardrobe pieces with category, color, season, and occasion metadata.
- Persistent IndexedDB wardrobe, photos, profile, saved outfits, and calendar plans.
- Four personal style directions, palette preferences, and occasion selection.
- Deterministic recommendation rules using season eligibility, occasion, favorite pieces, palette, and style; repeated suggestions vary the selected pieces.
- Interactive outfit canvas: one piece per category, remove pieces, name/save looks, and remix saved outfits.
- Outfit favorites, calendar assignment/removal, category/color insights, and saved-look coverage.
- JSON export of wardrobe data from Style profile.

## Data and limitations

Data stays in the current browser and origin. Clearing browser data removes it; there is no account, cloud sync, backup import, or cross-device sharing. Export a JSON copy before clearing storage. Multiple concurrent tabs are not synchronized. Photos are stored as compressed data URLs in IndexedDB. Very large collections may reach the browser's quota; save failures are surfaced in the interface.

Recommendations are transparent rules, not visual AI, weather forecasts, or fashion compatibility guarantees. A complete base outfit requires a dress or both a top and bottom; shoes and accessories are optional. Insights measure inclusion in saved looks, not actual wear history. Deleting a piece removes its references from saved looks, which can leave incomplete looks.

The app starts with an empty collection. The editorial illustrations are decorative, not demo wardrobe data.

## Structure

- `app/page.tsx`: wardrobe interface and feature flows.
- `app/globals.css`: editorial design system and responsive styling, with Tailwind available.
- `lib/storage.ts`: IndexedDB persistence and photo preparation.
- `lib/engine.ts`: recommendation rules and data model.
- `lib/engine.test.ts`: recommendation and deletion integrity tests.
- `tests/closet.spec.ts`: browser workflow and persistence smoke test.

## Production deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for isolated Vercel deployment instructions. Use a new `styledna-closet` project, Node.js 24, and the included Next.js deployment configuration. No secrets are needed by the app itself.
