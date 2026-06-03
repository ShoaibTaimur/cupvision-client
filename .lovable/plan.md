# CupVision Build Plan

## Approach

This Lovable project already runs on **TanStack Start** (not plain Vite+React Router), so the frontend uses TanStack Router file-based routes. All API calls go to `import.meta.env.VITE_API_URL`. The Express + MongoDB backend lives in a `/server` folder you'll deploy to Vercel/Render yourself — Lovable won't run it.

**Admin auth: env-based.** Credentials and the session token live in backend env vars. No bcrypt, no JWT, no admins collection.

> Note: I can write the backend code, but I cannot run it, connect to MongoDB, or test endpoints from here. You'll run/deploy it. The frontend will be tested against your deployed backend URL once you set `VITE_API_URL`.

---

## Repository Layout

```
/                           ← frontend (existing TanStack Start app)
  public/
    matches-template.csv    ← downloadable CSV template
  src/routes/               ← public + admin pages
  src/lib/api.ts            ← fetch wrapper using VITE_API_URL
  src/lib/auth.ts           ← token storage helpers
  src/components/           ← UI components
  .env.example
/server                     ← standalone Express backend (you deploy)
  src/
    index.ts                ← Express bootstrap, CORS, routes
    db.ts                   ← MongoDB native client + collections
    middleware/auth.ts      ← Bearer-token check vs ADMIN_TOKEN env
    routes/
      auth.ts               ← POST /api/auth/login (env compare)
      teams.ts, matches.ts, results.ts, authors.ts, stats.ts, import.ts
  package.json
  tsconfig.json
  vercel.json
  .env.example
```

---

## Backend (/server)

**Stack:** Node + Express + TypeScript + MongoDB native driver + multer + papaparse + zod + cors

**Env:**
```
PORT=5000
MONGODB_URI=<your Atlas URI>
DB_NAME=cupvision
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=<long random string>
```

**Auth:** `POST /api/auth/login { username, password }` → env compare → returns `{ token: ADMIN_TOKEN }`. Protected routes check `Authorization: Bearer <ADMIN_TOKEN>` (constant-time compare).

**Public endpoints:** `GET /api/teams`, `/api/matches?status=&group=&q=`, `/api/matches/:id`, `/api/authors`, `/api/stats/scoreboard`, `/api/stats/team/:id`, `/api/stats/tournament`, `/api/timeline`, `/api/live`, `/api/upcoming`

**Admin endpoints (Bearer required):** full CRUD on `teams`, `matches`, `authors`; `POST /api/matches/:id/result`; `POST /api/import/validate`, `POST /api/import/commit`

**Stats computed on read** from completed matches. Ranking: Points DESC → Wins DESC → Name ASC.

**Vercel:** `vercel.json` rewrites all routes to `src/index.ts` exporting the Express app as a serverless handler.

---

## CSV Template (Downloadable)

**File:** `public/matches-template.csv` — served at `/matches-template.csv`, downloadable from the Admin Import page via a "Download CSV template" button.

**Format:**
```csv
matchNumber,homeTeam,awayTeam,date,time,stadium,city,stage,group,status
1,Mexico,Canada,2026-06-11,20:00,Estadio Azteca,Mexico City,Group Stage,A,scheduled
2,USA,Wales,2026-06-12,18:00,SoFi Stadium,Los Angeles,Group Stage,B,scheduled
3,Argentina,Brazil,2026-06-13,21:00,MetLife Stadium,New York,Group Stage,C,scheduled
```

**Field rules** (also shown on the Import page):
| Column | Type | Required | Notes |
|---|---|---|---|
| `matchNumber` | int | yes | Unique |
| `homeTeam` | string | yes | Auto-created if new |
| `awayTeam` | string | yes | Auto-created if new |
| `date` | `YYYY-MM-DD` | yes | |
| `time` | `HH:MM` (24h) | yes | |
| `stadium` | string | yes | |
| `city` | string | yes | |
| `stage` | string | yes | e.g. `Group Stage`, `Round of 32` |
| `group` | A–L | yes if Group Stage | Empty otherwise |
| `status` | enum | yes | `scheduled` \| `live` \| `awaiting_result` \| `completed` \| `cancelled` \| `postponed` |

**Import flow on the admin page:**
1. Click "Download CSV template" → gets the template above
2. Fill in matches in Excel/Sheets, save as CSV
3. Upload → backend `POST /api/import/validate` parses + returns errors/warnings + preview rows
4. Confirm → `POST /api/import/commit` auto-creates new teams from unique names and inserts matches

**Validation:** required columns present, no empty required cells, no duplicate `matchNumber` (in file or DB), valid `group`, valid `status`, parseable date/time.

---

## Frontend (this project)

**Routes** (under `src/routes/`):
- `index.tsx` — Home (hero, live match, upcoming countdown, recent results, tournament stats)
- `matches.tsx` — search + status/group filters + match cards
- `scoreboard.tsx` — ranking table + team-details modal (Overview / Wins / Draws / Losses / Upcoming)
- `timeline.tsx` — chronological matches
- `authors.tsx` — author cards with socials
- `about.tsx`
- `admin.login.tsx` — credentials form
- `_admin.tsx` — token-guarded layout
- `_admin.dashboard.tsx`, `_admin.matches.tsx`, `_admin.teams.tsx`, `_admin.authors.tsx`, `_admin.import.tsx` (with template download)

**Shared:**
- `src/lib/api.ts` — typed fetch wrapper, attaches Bearer token from `localStorage`
- `src/lib/auth.ts` — token storage + `useAuth` hook
- Dark-first Tailwind theme via tokens in `src/styles.css`, shadcn/ui, skeleton loaders, CSS transitions only
- Each public route gets its own `head()` meta

**`.env.example`:** `VITE_API_URL=http://localhost:5000`

---

## Build Order

1. Backend scaffold (`/server` package, tsconfig, Express bootstrap, MongoDB client, env-based auth, CORS)
2. Backend routes (auth → teams → matches → results → authors → stats → CSV import)
3. Frontend shared layer (theme, layout/nav, api client, auth hook)
4. Public pages (Home, Matches, Scoreboard + team modal, Timeline, Authors, About)
5. Admin pages (login, guarded layout, dashboard, CRUD screens, CSV import wizard with template download)
6. `public/matches-template.csv`
7. README with local-dev + Vercel deploy steps

---

## What I need from you (after build)

- MongoDB Atlas connection string → `/server/.env` + Vercel envs
- Pick `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and generate a long random `ADMIN_TOKEN`

Ready to build on approval.
