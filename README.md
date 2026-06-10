# Khushi HR

A simple staff clock in/out and timesheet system for restaurants. Employees tap their name on a wall-mounted tablet, enter a PIN, and clock in/out or take breaks. Admins view a timesheet grid showing hours worked per employee per day.

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript + React Query
- **Backend**: Express + TypeScript + Prisma
- **Database**: PostgreSQL

## Prerequisites

- Node.js >= 18
- PostgreSQL running locally (via the provided `docker-compose.yml`, or a native install)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start PostgreSQL
Using Docker:
```bash
docker compose up -d
```
Or use a native PostgreSQL install. Either way, you need a `postgres` user with password `postgres` and a database named `khushi_hr_dev` (matching `backend/.env.example`).

### 3. Configure environment variables
Copy `backend/.env.example` to `backend/.env` and adjust if needed:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/khushi_hr_dev?schema=public"
PORT=4000
```

### 4. Run migrations and seed the database
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..
```

The seed creates an admin (PIN `0000`) and several employees (PIN `1234`) with sample shift history.

### 5. Start the dev servers
In separate terminals:
```bash
npm run dev:backend   # Express on http://localhost:4000
npm run dev:frontend  # Vite on http://localhost:5173
```

### 6. Verify the setup
```bash
bash verify-setup.sh
```

## Project Structure

```
khushi-hr/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # User, Shift, Break models
│   │   ├── seed.ts         # Sample data
│   │   └── migrations/
│   └── src/
│       └── index.ts        # Express app entry point
├── frontend/
│   └── src/
│       ├── main.tsx        # React entry point
│       └── App.tsx         # Root component
└── docker-compose.yml       # Local PostgreSQL
```

## Data Model

- **User** — employees and admins, identified by name + PIN (no email/login required)
- **Shift** — one row per clock-in, with `clockIn`/`clockOut`/`totalHours`
- **Break** — one row per break taken during a shift
