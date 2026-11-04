# Deploy StyleDNA CLOSET to Vercel

Create a **new project** named `styledna-closet`. Do not select, link, or replace the StyleDNA Personality Test or Runway Together projects. Do not reuse their domains, project IDs, or environment variables.

## Direct deployment from your computer (no GitHub push required)

1. Extract `styledna-closet-vercel.zip` and open a terminal in the extracted `styledna-closet` directory. Use Node.js 24.
2. Run:

   ```sh
   npm ci
   npm run typecheck
   npm test
   npm run build
   npx vercel login
   npx vercel link
   ```

3. In the link prompts, choose your intended Vercel account/team. Answer **No** to linking an existing project and create **styledna-closet** with the current directory as its root. If that name already exists, choose a new unique name such as `styledna-closet-mvp`; do not link it without checking what it contains.
4. Confirm that the newly generated `.vercel/project.json` belongs to that new project, then run:

   ```sh
   npx vercel --prod
   ```

5. Open the exact production URL returned by the CLI. Verify the StyleDNA CLOSET landing page, upload a clothing photo, reload to check persistence, then test the studio, saved looks, calendar, and insights. Check mobile device emulation as well. In Vercel project settings, check Deployment Protection if you need anonymous public access; adjust it only for this new CLOSET project.

No environment variables or external database are required. `vercel.json` uses the Next.js preset, `npm ci`, and `npm run build`; `package.json` selects Node.js 24. Leave the output directory at the framework default. Do not configure a static `out` directory or a custom domain belonging to either existing application.

## GitHub-connected deployment alternative

The dedicated GitHub repository is `mason040430/styledna-closet`.

1. Sign in at https://vercel.com/new using your GitHub account.
2. Import **mason040430/styledna-closet**. If it is missing, use the GitHub access configuration shown by Vercel to grant access to this repository.
3. Create a **new project** named `styledna-closet` (or another unique CLOSET name). Keep root directory `.` and the detected **Next.js** framework. No environment variables are required.
4. Click **Deploy**, then open the production URL Vercel provides and verify the application.

Do not select StyleDNA Personality Test or Runway Together, and do not reuse their custom domains.

## Storage behavior

Each browser and origin has its own IndexedDB wardrobe. The production URL begins with an empty closet, and localhost/preview data does not migrate automatically. Prefer the stable production domain for continued testing. Uploads stay in the browser, not on Vercel; no account or cross-device synchronization is provided.

## Deployment status

This source package is prepared for deployment, not deployed. The cloud session has no Vercel integration, CLI authentication, or Vercel token. Its network proxy returns HTTP 403 for `api.vercel.com`. GitHub access is handled separately through the dedicated repository. No Vercel project, custom domain, or production URL was created or changed.
