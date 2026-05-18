# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commits & PRs

Never add co-author attribution or any Claude reference to git commits or PRs.

## Project Overview

**Gaming Vault** — a shared gaming library app for a fixed set of users (Tox, Jedis, Chango). Users search games via IGDB, add them to a shared DynamoDB vault, track play status, and watch trailers via YouTube. Auth is PIN-based with no sessions or JWT.

## Commands

### Backend (`vault-backend/`)
```bash
npm run dev          # nodemon + ts-node dev server on PORT (default 3000)
npm run create-table # bootstrap DynamoDB table
```

### Frontend (`vault-frontend/`)
```bash
npm run dev          # Vite dev server on :5173
npm run dev -- --host  # expose on LAN (mobile testing)
npm run build        # tsc --noEmit + vite build
npm run lint         # ESLint
```

There are no automated tests in this project.

## Architecture

### Backend (`vault-backend/src/`)

Express 5 + TypeScript. Entry: `index.ts` → `app.ts` (CORS, routes).

**Routes:**
- `POST /auth/login` — validates username + PIN against `PIN_TOX/PIN_JEDIS/PIN_CHANGO` env vars
- `GET /auth/users` — returns the list of valid usernames
- `GET /games/search?q=` — proxies IGDB search
- `GET /games[?user=]` — fetch vault (optional user filter)
- `POST /games` — fetch IGDB details + YouTube trailer, write to DynamoDB
- `PATCH /games/:id/status` — update status (Pendiente/Jugando/Jugado/Abandonado)
- `DELETE /games/:id` — remove from vault

**Services:**
- `igdb.service.ts` — Twitch OAuth2 client credentials flow with in-memory token cache; auto-refreshes before expiry
- `youtube.service.ts` — searches for official trailer; falls back to a hardcoded ID if key missing or quota hit
- `dynamo.service.ts` — DynamoDB operations; all games share `vaultId = "shared"` as partition key, `gameId` (UUID) as sort key

**Config:** `config/env.ts` is the single source for all env vars — add new vars there, not inline.

### Frontend (`vault-frontend/src/`)

React 19 + Vite + TypeScript. No router (single-page), no state library — plain `useState`/`useRef`. User session persisted in `localStorage`.

**Key files:**
- `App.tsx` — orchestrates all state: auth, vault data, search, view mode (grid/list), active modals
- `api/axios.ts` — Axios instance pointed at `VITE_API_URL`; all API calls go through `vaultApi` methods here
- `types/game.ts` — shared `Game` and `GameStatus` types; keep in sync with backend `models/game.model.ts`

**Component roles:**
- `GameCardGrid.tsx` — 3D flip-card; front = cover, back = status picker + actions
- `SearchView.tsx` — full-screen search overlay with debounced input and add-to-vault action
- `LoginScreen.tsx` — PIN entry for the three fixed users
- `VideoModal.tsx` — YouTube iframe embed triggered from card actions

### Data Model

```typescript
// vaultId is always "shared" (DynamoDB PK)
interface Game {
  id: string;           // UUID (DynamoDB SK as gameId)
  name: string;
  releaseYear: number;
  coverImage: string;   // full IGDB URL
  description: string;
  platforms: string[];
  youtubeVideoId: string;
  addedBy: string;      // username
  createdAt: string;    // ISO string
  status: GameStatus;   // 'Pendiente' | 'Jugando' | 'Jugado' | 'Abandonado'
}
```

### Environment Variables

**Backend** (`.env`):
```
PORT, IGDB_CLIENT_ID, IGDB_CLIENT_SECRET, YOUTUBE_API_KEY
AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DYNAMO_TABLE_NAME
FRONTEND_URL, PIN_TOX, PIN_JEDIS, PIN_CHANGO
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3000
```

## Infrastructure

AWS DynamoDB is the only cloud resource currently in use. Terraform for full AWS infrastructure is planned for a later phase.
