# CupVision

CupVision is full stack FIFA World Cup 2026 tracker.

It ships with:-

- Public site for matches, scoreboard, timeline, authors, about
- Public squads page for team rosters and player roles
- Live watch page for published channels
- Admin area for login, dashboard, teams, matches, authors, players, CSV import
- Backend API in `/server`
- MongoDB Atlas storage

Frontend talks to backend through `VITE_API_URL`.

## Stack

- Frontend: Vite, React, TypeScript, Tailwind CSS
- State/data: TanStack Query
- UI: Radix UI, Lucide, Sonner, shadcn-style components
- Backend: Node.js, Express, TypeScript
- Database: MongoDB Atlas

## Project Layout

- `client/` - frontend app
- `server/` - API server
- `client/public/matches-template.csv` - CSV import template
- `client/public/players-template.csv` - squad/players CSV import template

## Local Setup

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Backend default: `http://localhost:5500`

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend default: Vite local dev URL.

## Environment Variables

### `server/.env`

```env
PORT=5500
MONGODB_URI=mongodb+srv://...
DB_NAME=cupvision
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=replace_with_your_own_username
ADMIN_PASSWORD=replace_with_your_own_password
ADMIN_TOKEN=replace-with-long-random-string
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5500
```

Notes:

- `ADMIN_TOKEN` is the shared admin bearer token returned by login and stored in browser `localStorage` for admin requests.
- `CLIENT_URL` must allow frontend origin in server CORS config.
- Never commit real secrets.

## Frontend Features

- Home hero with live match, next match countdown, tournament stats
- Matches page with search and filters
- Scoreboard page with team standings
- Timeline page with chronological match list
- Authors page
- About page
- Squads page with roster filters by team and position
- Watch page for published live channels
- Admin login and admin workspace
- Match CSV import with validate/commit flow
- Players CSV import with validate/commit flow

## Backend Features

- Public match/team/author/stats endpoints
- Public players endpoint for team squads
- Public live channel listing and playback endpoint
- Admin auth
- CRUD for teams, matches, authors, players
- CRUD for channels
- Match result submission
- Match CSV validate/commit import
- Players CSV validate/commit import
- MongoDB-backed data model

## API Overview

### Public

- `GET /api/teams`
- `GET /api/teams/:id`
- `GET /api/matches`
- `GET /api/matches/:id`
- `GET /api/authors`
- `GET /api/players`
- `GET /api/channels`
- `GET /api/channels/:id/stream`
- `GET /api/stats/scoreboard`
- `GET /api/stats/team/:id`
- `GET /api/stats/tournament`

### Admin

- `POST /api/auth/login`
- `GET /api/channels/admin`
- `POST /api/channels`
- `PUT /api/channels/:id`
- `DELETE /api/channels/:id`
- `POST /api/teams`
- `PUT /api/teams/:id`
- `DELETE /api/teams/:id`
- `POST /api/matches`
- `PUT /api/matches/:id`
- `DELETE /api/matches/:id`
- `POST /api/matches/:id/result`
- `POST /api/authors`
- `PUT /api/authors/:id`
- `DELETE /api/authors/:id`
- `POST /api/import/players/validate`
- `POST /api/import/players/commit`
- `POST /api/import/validate`
- `POST /api/import/commit`

## CSV Import

Templates live at `client/public/matches-template.csv` and `client/public/players-template.csv`.

Flow:

1. Download template
2. Fill rows
3. Upload CSV in Admin → Import
4. Validate
5. Confirm import

Required columns:

- `matchNumber`
- `homeTeam`
- `awayTeam`
- `date`
- `time`
- `stadium`
- `city`
- `stage`
- `group`
- `status`

Allowed `status` values:

- `scheduled`
- `live`
- `awaiting_result`
- `completed`
- `cancelled`
- `postponed`

Players import columns:

- `teamName`
- `name`
- `position`
- `jerseyNumber`
- `dateOfBirth`
- `height`
- `club`
- `nationality`
- `role`

Allowed player `position` values:

- `GK`
- `DEF`
- `MID`
- `FWD`
- `COACH`

## Build

```bash
cd client
npm run build
```

```bash
cd server
npm run build
```

## Deploy

### Backend

- Deploy `server/`
- Set server env vars in host
- Keep `CLIENT_URL` set to frontend origin
- Protect private admin routes with `ADMIN_TOKEN`

### Frontend

- Deploy `client/`
- Set `VITE_API_URL` to backend URL

## Notes

- Stats are computed from match data, not stored separately.
- Admin auth token is handled in browser localStorage and sent as Bearer auth on admin requests.
- Channel playback is public for published streams and loads from the channel `sourceUrl`.
- Public/admin UI assume backend is running.
- Keep `.env` files private.
