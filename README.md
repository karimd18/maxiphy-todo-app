# Maxiphy Todo – NestJS + Prisma + PostgreSQL + Next.js (App Router)

A polished full-stack Todo application aligned with the **Maxiphy Full-Stack Assessment**.

- **Backend:** NestJS • Prisma ORM • PostgreSQL
- **Frontend:** Next.js (App Router, Server Components) • TypeScript • Tailwind
- **Auth:** JWT (HTTP-only cookie used by the Next app; backend expects Bearer token)
- **Features:** Status enum (pending/active/completed), priority (LOW/MEDIUM/HIGH), date, pins, search, sort (date/priority/status), pagination, profile & password update, responsive UI, light/dark theme.

---

## Contents

- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database & Prisma](#database--prisma)
- [Running the Apps](#running-the-apps)
- [API Reference](#api-reference)
- [Frontend Notes](#frontend-notes)
- [Tests (optional)](#tests-optional)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

**Backend**
- [NestJS](https://nestjs.com/) – modular Node framework
- [Prisma](https://www.prisma.io/) – ORM (TypeScript)
- [PostgreSQL](https://www.postgresql.org/) – database
- JWT auth (access token), bcrypt password hash

**Frontend**
- [Next.js (App Router)](https://nextjs.org/) – Server Components, API routes as proxy
- TypeScript, Tailwind CSS
- Accessible, responsive UI with light/dark theme

---

## Project Structure

```
.
├── server/                         # NestJS backend
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── prisma/
│   │   │   └── prisma.service.ts
│   │   ├── auth/                   # register/login/me + JWT strategy/guard
│   │   ├── users/                  # /users/me (profile, change password)
│   │   └── todos/                  # CRUD + filtering/sorting/pagination
│   ├── prisma/
│   │   └── schema.prisma           # User, Todo, enums
│   ├── .env.example
│   └── docker-compose.yml          # Postgres (local dev)
│
└── client/                         # Next.js frontend
    ├── src/app/
    │   ├── layout.tsx              # header/footer, theme
    │   ├── page.tsx                # landing
    │   ├── login/                  # auth
    │   ├── register/
    │   ├── profile/                # settings
    │   └── todos/                  # list, new, [id]/edit
    ├── src/components/             # UI: Button, Input, ThemeToggle, TodoItem...
    ├── src/lib/                    # serverFetch (proxy), utils
    ├── src/types.ts                # shared types
    ├── public/
    └── .env.local.example
```

---

## Quick Start

### 1) Clone

```bash
git clone https://github.com/<you>/<repo>.git
cd <repo>
```

### 2) Start Postgres (Docker)

```bash
cd server
docker compose up -d
# If you ever see "container name already in use", remove the old one:
# docker rm -f todo_pg
```

### 3) Install deps

```bash
# backend
cd server
npm i

# frontend
cd ../client
npm i
```

### 4) Configure env

Copy the env examples and edit:

```bash
# backend
cd server
cp .env.example .env

# frontend
cd ../client
cp .env.local.example .env.local
```

Fill in values as described below.

---

## Environment Variables

### Backend (`server/.env`)

```env
# PostgreSQL (Docker compose maps these)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todos?schema=public"

# JWT
JWT_SECRET="dev_super_secret_key_change_me"
JWT_EXPIRES_IN="7d"

# CORS (optional)
CORS_ORIGIN="http://localhost:3001"  # your Next dev URL
PORT=3000
BCRYPT_SALT_ROUNDS=10
```

### Frontend (`client/.env.local`)

```env
# Used by server components and API proxy logic
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3000"
```

> The app uses `NEXT_PUBLIC_BACKEND_URL` (client-side) and `BACKEND_URL` (server-side). If not set, some API routes proxy via `/api/*`.

---

## Database & Prisma

From `server/`:

```bash
# Generate Prisma Client
npx prisma generate

# Create schema & migrations (dev)
npx prisma migrate dev -n init

# (Optional) open Prisma Studio
npx prisma studio
```

> If your DB drifted or you deleted migrations, reset safely:
>
> ```bash
> npx prisma migrate reset
> # then run migrate dev again
> ```

---

## Running the Apps

### Backend (Nest)

```bash
cd server
npm run start:dev
# API on http://localhost:3000
```

### Frontend (Next)

```bash
cd client
npm run dev
# App on http://localhost:3001
```

> Make sure `NEXT_PUBLIC_BACKEND_URL`/`BACKEND_URL` point to the backend (`http://localhost:3000`).

---

## API Reference

Base URL: `http://localhost:3000`

All protected routes require `Authorization: Bearer <token>` (the Next app stores it in an HTTP-only cookie and forwards it via its /api proxy).

### Auth

- **POST** `/auth/register`  
  **Body**
  ```json
  { "name": "Jane", "email": "jane@example.com", "password": "Passw0rd!" }
  ```
- **POST** `/auth/login`  
  **Body**
  ```json
  { "email": "jane@example.com", "password": "Passw0rd!" }
  ```
  **Response**
  ```json
  { "access_token": "<JWT>", "user": { "id":"...", "name":"Jane", "email":"..." } }
  ```
- **GET** `/auth/me` → returns current user data

### Users

- **PATCH** `/users/me` – update profile
  ```json
  { "name": "Jane Doe", "email": "jane@example.com" }
  ```
- **POST** `/users/change-password`
  ```json
  { "currentPassword": "Passw0rd!", "newPassword": "N3wPass!" }
  ```

### Todos

**Model fields**
```ts
{
  id: string;
  userId: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "pending" | "active" | "completed";   // API uses lowercase
  date: string | null;
  pinned: boolean;
  pinnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

- **GET** `/todos` – list with filters, sorting & pagination

  **Query params**
  - `q` – search in description; if `YYYY-MM-DD`, matches that day
  - `status` – `pending|active|completed` (omit = **All**)
  - `sortBy` – `date|priority|status|createdAt|pinned` (default `date`)
  - `sortDir` – `asc|desc` (default `asc`)
  - `page` – number (default `1`)
  - `pageSize` – number (default `10`)
  - `pinnedOnly` – `true|false`

  **Response**
  ```json
  {
    "items": [ ...todos ],
    "meta": { "total": 12, "page": 1, "pageSize": 10, "totalPages": 2 }
  }
  ```

- **POST** `/todos` – create
  ```json
  {
    "description": "Prepare sprint deck",
    "priority": "MEDIUM",
    "status": "pending",
    "date": "2025-09-10T00:00:00.000Z",
    "pinned": false
  }
  ```

- **GET** `/todos/:id` – get one

- **PATCH** `/todos/:id` – update (partial)
  ```json
  {
    "description": "Deck + review",
    "priority": "HIGH",
    "status": "active",
    "date": null,            // clear date
    "pinned": true
  }
  ```

- **DELETE** `/todos/:id` – delete (must be your own)

Security:
- Todo routes are guarded by JWT.
- Update/Delete is restricted to the owner.

---

## Frontend Notes

- **Routes**
  - `/` – landing
  - `/login`, `/register` – auth
  - `/todos` – list (tabs + search + sort + pagination)
  - `/todos/new` – create
  - `/todos/[id]/edit` – edit
  - `/profile` – update name/email & change password
- **UI/UX**
  - Advanced but clean UI, **light/dark** support
  - Sort **dropdown** with z-index/portal so it overlays content
  - Debounced search (client) hitting server filters
  - Chips for **status** and **priority**
  - **Pin** tasks and sort/pin precedence
- **Data fetching**
  - Server Components for pages; `/api/*` routes proxy requests to the backend and attach the auth token from cookies.
- **Types**
  - Shared in `client/src/types.ts` (matches API fields)
- **Theming**
  - Lightweight theme script + Tailwind color tokens (`bg`, `card`, `border`, `fg`, `muted`, `accent`)

---

## Tests (optional)

If you add tests:
- **Backend:** Jest (unit test at least one service + one controller)
- **Frontend:** `@testing-library/react` for one component

---

## Troubleshooting

- **Docker container name conflict**
  ```bash
  docker rm -f todo_pg
  docker compose up -d
  ```

- **Prisma: table/column does not exist**  
  Run migrations against your local DB:
  ```bash
  npx prisma migrate dev
  ```

- **Prisma: drift detected / missing migrations**
  ```bash
  npx prisma migrate reset
  npx prisma migrate dev -n init
  ```

- **Tailwind/PostCSS errors**
  - For Tailwind v3.4:
    ```js
    // client/postcss.config.js
    module.exports = {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    };
    ```
  - Ensure `globals.css` has:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

- **Status casing**  
  Frontend always sends **lowercase** (`pending|active|completed`). Backend maps to DB enum internally.

---

## Contributing

1. Fork & create a feature branch
2. Commit with clear messages
3. Open a PR describing what/why/how
4. Please include screenshots for UI changes

---

## License

[MIT](LICENSE)
