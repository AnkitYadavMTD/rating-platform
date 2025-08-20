# Rating Platform — FullStack Intern Coding Challenge

Tech stack:
- Backend: **Express.js + TypeScript + Prisma + PostgreSQL + JWT**
- Frontend: **React + Vite + TypeScript + React Router + Axios**

## Quick Start

### 1) Prerequisites
- Node 18+
- PostgreSQL 13+

### 2) Backend (.env)
Create `server/.env` from `.env.example` and fill DB + JWT secrets:
```
cp server/.env.example server/.env
```
Edit values as needed.

### 3) Install & Migrate (Backend)
```
cd server
npm install
npx prisma migrate dev --name init
npm run dev
```
This will start the API at `http://localhost:4000`.

### 4) Seed Admin (optional)
Use the signup endpoint to create a normal user, then as admin you can upgrade roles.
For a quick start, run:
```
npm run seed:admin
```
This creates an Admin with credentials from `.env` (ADMIN_EMAIL/ADMIN_PASSWORD).

### 5) Frontend
```
cd ../client
npm install
npm run dev
```
App runs at `http://localhost:5173` (Vite).

## Default Roles
- `ADMIN`
- `USER`
- `OWNER`

## API Summary
- `POST /auth/signup` — normal user sign-up
- `POST /auth/login` — login for all roles
- `POST /auth/password` — update own password (auth required)

### Admin
- `POST /admin/users` — add user (name, email, password, address, role)
- `GET /admin/users` — list users (filters + sort)
- `GET /admin/users/:id` — user details (includes rating if OWNER)
- `POST /admin/stores` — add store (name, email, address, ownerId optional)
- `GET /admin/stores` — list stores (name, email, address, rating + filters + sort)
- `GET /admin/metrics` — { totalUsers, totalStores, totalRatings }

### Stores (User)
- `GET /stores` — list stores with overallRating + currentUserRating + search/sort
- `POST /stores/:id/rate` — submit/update rating { value: 1..5 }

### Owner
- `GET /owner/summary` — { store, avgRating, raters[] }

## Validation Rules (Backend & Frontend)
- Name: 20–60 chars
- Address: ≤ 400 chars
- Password: 8–16 chars, ≥ 1 uppercase & 1 special char
- Email: standard format

## Notes
- Tables support sorting (`sortBy`, `sortOrder`) and filtering (name/email/address/role) via query params.
- JWT is stored in localStorage (demo). Use HttpOnly cookies in production.
