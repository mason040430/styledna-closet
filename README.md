# StyleDNA CLOSET — V2

**Your wardrobe, intelligently organized.** A responsive web app that turns photos of clothes you own into a searchable digital closet, outfit ideas with clear reasons, a planning calendar and honest wardrobe insights. Part of the StyleDNA project (the [Fashion Personality Test](https://style-dna-zeta.vercel.app/) is an optional input, never a requirement).

## What works today

| Area | What it does |
| --- | --- |
| Demo mode | Separate, clearly labelled closet with 21 fictional illustrated items, 3 looks and plans. Resettable. Never mixed with your data. |
| Add items | Single or batch upload (up to 30), drag-and-drop, phone camera, previews, progress, per-photo errors. |
| On-device photo suggestions | Main/secondary color, solid/striped/patterned, background cleanup on plain backgrounds (original always kept), category from filename keywords or a shape guess. Everything is editable; failures never block saving. No paid AI, no network calls. |
| Digital wardrobe | Category tabs, search, color/season/occasion/favorite filters, sorting, item detail, edit, delete with confirmation, favorites, custom tags, notes, brand, price, purchase date, multiple photos, wear count, cost per wear. |
| Outfit Studio | Pick pieces by category, completeness check, "suggest the rest", save, name, edit, save as new, duplicate, delete, favorite. |
| Stylist | Plain-English requests ("what can I wear with my boots?", "three looks with my jacket", "minimal black outfit", "winter outfit"), season/occasion/mood filters, 3 diverse looks built only from your items, "why this works" reasons, thumbs up/down that change future scores, "try something new" stretch looks. |
| Calendar | Month view, plan saved looks on dates, swap/remove, mark worn (updates wear counts). |
| Insights | Category and color mix, most/least worn, cost per wear, repeated looks, wardrobe gaps — computed only from real data with helpful empty states. |
| Style profile | Styles, favorite and avoided colors, occasions, how adventurous suggestions should be. Optional import of a StyleDNA result link (reads the scores in the link; nothing fetched) as an editable starting point. |
| Data | Export backup (JSON incl. photos), reset demo, delete my data. |

## Persistence model (important)

V2 is **local-first**: your closet is stored in this browser's IndexedDB on this device. There is no account and no cloud sync yet; another device or browser profile sees an empty closet; clearing browser data deletes it (export a backup). Demo data lives in a separate database.

Cloud accounts (sign-in, cross-device sync, private photo storage) are the next step and need a backend such as Supabase connected by the owner. The data layer is behind a `Repo` interface (`src/lib/db.ts`) so a cloud adapter can be added without touching the UI.

## Run, test, build

```sh
npm ci
npm run dev          # local dev server
npm test             # unit tests (recommender, prompt parsing, photo analysis, quiz link, insights)
npm run build        # production build → dist/
npm run test:e2e     # Playwright browser tests (needs Chrome; set CHROME_PATH if not /usr/bin/google-chrome)
npm run build:single # one-file build → dist-single/index.html
```

## Deploy

Static site. On Vercel: import this repository, choose the `v2` branch, framework **Vite**, no environment variables. Create a **new** project (e.g. `styledna-closet-v2`) — do not reuse the StyleDNA test or Runway Together projects.

## Structure

- `src/lib/` — data model, IndexedDB repo, on-device vision, recommender, prompt parser, quiz bridge, insights, demo data
- `src/pages/` — screens; `src/components/` — shared UI
- `tests/` — Playwright end-to-end tests and fixture photos
