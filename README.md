# CupVision

Full-stack FIFA World Cup 2026 tracker — **Track. Analyze. Follow.**

- **Frontend**: React + TypeScript + TanStack Router + Tailwind CSS (this repo root)
- **Backend**: Node.js + Express + TypeScript + MongoDB (in `/server`)
- **Database**: MongoDB Atlas

The two are deployed independently. The frontend hits the backend at `VITE_API_URL`.

---

## 1. Backend setup (`/server`)

```bash
cd server
cp .env.example .env
# edit .env and paste your MongoDB connection string + pick admin creds
npm install
npm run dev          # http://localhost:5000
```

### `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/
DB_NAME=cupvision
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=replace-with-a-long-random-string
```

> `ADMIN_TOKEN` is the bearer token returned on successful login. Generate a long random value (e.g. `openssl rand -hex 32`).

### Production build

```bash
cd server
npm run build
npm start
```

### Deploying to Vercel

1. Create a new Vercel project, set Root Directory to `server`.
2. Add all env vars from `.env` to the Vercel project.
3. Deploy. The included `vercel.json` exposes `src/index.ts` as a serverless function.

---

## 2. Frontend setup (repo root)

```bash
cp .env.example .env
# edit .env: VITE_API_URL=http://localhost:5000   (or your deployed backend)
bun install        # or npm install
bun dev            # or npm run dev
```

### Deploying to Vercel / Netlify / any static host

Set `VITE_API_URL=https://your-backend-url` in the deploy env vars, then build:

```bash
bun run build
```

---

## 3. Admin login

Visit `/admin/login` and use the credentials you set in the backend `.env`
(defaults: `admin` / `admin123`). Change them before going public.

---

## 4. CSV import format

Download the ready-to-use template from the Admin → Import page (or grab
`public/matches-template.csv`). Columns:

| Column        | Required    | Notes                                                                              |
| ------------- | ----------- | ---------------------------------------------------------------------------------- |
| `matchNumber` | yes         | positive int, unique                                                               |
| `homeTeam`    | yes         | auto-created if new                                                                |
| `awayTeam`    | yes         | auto-created if new                                                                |
| `date`        | yes         | `YYYY-MM-DD`                                                                       |
| `time`        | yes         | `HH:MM` (24-hour)                                                                  |
| `stadium`     | yes         | text                                                                               |
| `city`        | yes         | text                                                                               |
| `stage`       | yes         | e.g. `Group Stage`, `Round of 16`                                                  |
| `group`       | conditional | `A`–`L`, leave empty for knockouts                                                 |
| `status`      | yes         | `scheduled` / `live` / `awaiting_result` / `completed` / `cancelled` / `postponed` |

Workflow: upload → **Validate** (preview + errors) → **Confirm import**.

---

## API endpoints

### Public

- `GET /api/teams`, `GET /api/teams/:id`
- `GET /api/matches?status=&group=&q=`, `GET /api/matches/:id`
- `GET /api/authors`
- `GET /api/stats/scoreboard`, `GET /api/stats/team/:id`, `GET /api/stats/tournament`

### Admin (Bearer `ADMIN_TOKEN`)

- `POST /api/auth/login` `{ username, password }` → `{ token }`
- `POST/PUT/DELETE /api/teams`, `/api/matches`, `/api/authors`
- `POST /api/matches/:id/result` `{ homeScore, awayScore }`
- `POST /api/import/validate` (multipart: `file`)
- `POST /api/import/commit` (multipart: `file`)

---

## Notes

- Stats (P/W/D/L/Pts/GF/GA/GD) are **never stored** — they're computed on every request from completed matches. Ranking: Points DESC → Wins DESC → Team Name ASC.
- The frontend lives in `src/routes/` using TanStack Router file-based routing.
- Never commit `.env`. The included `.gitignore`s exclude it.
