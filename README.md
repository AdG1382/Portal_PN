# Physics Notebook Portal (v1 MVP)

React + Vite portal for `portal.physicsnotebook.in` with:

- Public student registration at `/register`
- Hidden affiliate access at `/affiliate` (direct URL only)
- Optional admin stub at `/admin`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env vars:
   ```bash
   cp .env.example .env
   ```
3. Start app:
   ```bash
   npm run dev
   ```

## Supabase

- Run SQL in `supabase/schema.sql`.
- Create affiliate auth users manually in Supabase dashboard.
- No public signup endpoint is exposed in this frontend.
