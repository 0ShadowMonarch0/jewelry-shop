
## Run Locally

**Prerequisites:** Node.js, a [Supabase](https://supabase.com) project (free tier is fine — this is the app's only datastore)

1. Install dependencies:
   `npm install`
2. Create a Supabase project, then in its SQL Editor run, in order:
   - [supabase-schema.sql](supabase-schema.sql) — creates all tables
   - [supabase-seed.sql](supabase-seed.sql) — loads the current product catalogue
3. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API in the Supabase dashboard — use the **service_role** key, not `anon`), plus `ADMIN_SECRET` / `ADMIN_EMAIL` / `ADMIN_DEFAULT_PASSWORD` for the admin login.
4. Run the app:
   `npm run dev`

The admin panel is at `/admin` (or `#admin`), signed in with `ADMIN_EMAIL` / `ADMIN_DEFAULT_PASSWORD`.

## Deploy to Vercel

The app is a Vite + React storefront backed by an Express API (`server/`), wired up for Vercel via [api/index.ts](api/index.ts) (serverless function entry) and [vercel.json](vercel.json) (routes `/api/*` to that function, everything else falls back to the SPA).

1. **Set up Supabase** (if you haven't already, see steps 2–3 above) — this is required, not optional. Vercel's filesystem is read-only in production, so the app has no other place to persist data.
2. **Push this repo to GitHub.**
3. **Import the repo in Vercel** (New Project → your repo). Vercel will detect the Vite/Node project; confirm:
   - Build Command: `vite build` (already set via `vercel.json`)
   - Output Directory: `dist` (already set via `vercel.json`)
4. **Add environment variables** in Vercel (Project → Settings → Environment Variables), from `.env.example`:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_SECRET`, `ADMIN_EMAIL`, `ADMIN_DEFAULT_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optional — used for admin media uploads)
5. **Deploy.** Once live, sign in at `https://your-app.vercel.app/admin`.

### Note on the pre-Vercel local database

Earlier local runs of this app stored data in `data/store.json` (a flat file), which no longer works on Vercel's read-only filesystem — the app now reads and writes Supabase directly for every request, in dev and in production alike. `supabase-seed.sql` was generated from that file, so anything you'd already created locally (including manually added products and Cloudinary uploads) carries over once you run it.
