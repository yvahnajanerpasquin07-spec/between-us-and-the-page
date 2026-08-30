# Between Us and the Page

A personal journal and poetry platform: multiple themed journals, poems with
optional Spotify tracks, and view-only sharing with specific registered users.

Stack: **React + Vite + Tailwind CSS + Supabase (Postgres, Auth, RLS) + Netlify.**

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/schema.sql` in full. It creates the
   `profiles`, `journals`, `poems`, and `journal_access` tables and turns on
   Row-Level Security so permissions are enforced by the database, not just
   hidden in the UI.
3. Go to Project Settings → API and copy the **Project URL** and **anon
   public key**. Never copy the `service_role` key into this project.

## 2. Configure the app

```bash
cp .env.example .env
# then paste your Project URL and anon key into .env
```

## 3. Install and run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Project structure

```
src/
├── components/   # Reusable UI: Navbar, JournalCard, SpotifyPlayer, ShareModal...
├── pages/        # Route-level screens: Home, Login, Dashboard, Journal, Poem
├── services/     # All Supabase calls live here — pages never call supabase directly
├── context/      # AuthContext: current user/session, available via useAuth()
├── hooks/        # useAsync: shared fetch/loading/error pattern
└── utils/        # Spotify URL parsing/validation
supabase/
└── schema.sql    # Tables + RLS policies — source of truth for permissions
```

## Notes on the design

- Palette and type are a deliberate "ink and paper" direction (Fraunces +
  Newsreader + a hand-lettered accent face) rather than a generic dashboard
  look — see `tailwind.config.js` for the token system.
- `ProtectedRoute` only prevents an anonymous visitor from *seeing* a page.
  The actual security boundary is the RLS policies in `schema.sql` — a
  signed-in viewer who isn't shared on a journal can't read or write it
  no matter what the frontend does.

## Deploying

Push to GitHub, then connect the repo in Netlify. Set the build command to
`npm run build`, the publish directory to `dist`, and add the same
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` values as environment
variables in the Netlify dashboard.

## Suggested build order

1. Auth (register/login/logout) — confirm `profiles` rows get created.
2. Journals: create/list/delete on the Dashboard.
3. Poems: create/edit/delete within a Journal.
4. Spotify embed on the Poem page.
5. Sharing: ShareModal + the `shared_journals` view on the Dashboard.
