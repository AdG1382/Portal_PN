# Physics Notebook Portal (v1 MVP)

React + Vite portal for `portal.physicsnotebook.in` with:

- Public student registration at `/register`
- Hidden affiliate access at `/affiliate` (direct URL only)
- Optional admin stub at `/admin`

## Product rules in this MVP

- Students only register. No student login or dashboard.
- Registration form has no referral-code input field.
- Referrals are captured only through affiliate-generated links using `?ref=...`.
- Affiliate functionality is not visible in the student UI.

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
