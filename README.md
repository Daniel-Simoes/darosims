# Daros IMS (darosims)

**Daros IMS** — React + TypeScript marketing site and dashboard for an Integrated Management System (IMS) platform (ISO compliance, documents, audits, and related modules).

## Features

- **Snowflake-style navigation** with mega dropdown menus (Platform, Solutions, Resources, Company)
- **Daros branding** from project identity (mission, values, ISO standards)
- **Sign In flow** → navigates to a basic dashboard
- **Dashboard** with all IMS modules from the project brief:
  - Process Management
  - Document Management
  - Risk Management
  - Audits
  - Supplier Management
  - Nonconformities
  - KPIs
  - Continual Improvement
  - ISO 9001 / 14001 / 45001 / 22000 compliance progress

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- Next.js API backend

## Getting Started

```bash
cd darosims
npm install
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Routes

| Route        | Description                    |
| ------------ | ------------------------------ |
| `/`          | Marketing homepage             |
| `/signin`    | Sign in page                   |
| `/dashboard` | IMS dashboard (after sign in)  |

## Build

```bash
npm run build
npm run preview
```

## Production (Vercel + darosims.com)

Deploy from the **`backend`** folder (Next.js serves the built Vite app and `/api`). See [docs/deployment/vercel-darosims.md](docs/deployment/vercel-darosims.md) for env vars and Let's Host DNS.
