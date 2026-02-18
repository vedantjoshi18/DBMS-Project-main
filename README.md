# EventManager

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

# Event Manager (DBMS Project)

A full-stack event management application with an Express/MongoDB backend and an Angular frontend. This repository contains the backend API (Node.js + Express + Mongoose) and an Angular 21 frontend UI.

## Key Features

- User authentication (JWT)
- Event creation and listing
- Booking management
- Seed script to populate example data
- Angular-based frontend with Material design

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: Angular 21, Angular Material
- Auth: JSON Web Tokens (JWT)

## Repo Layout

- `backend/` — Express API
	- `server.js` — app entry
	- `src/controllers/` — route handlers
	- `src/models/` — Mongoose models
	- `src/routes/` — Express routes
	- `src/middleware/` — middleware (auth, errors)
	- `src/config/database.js` — MongoDB connection (uses `MONGODB_URI`)
	- `scripts/seedData.js` — seed example data

- `frontend/` — Angular app
	- `src/app/` — components, services, routes
	- uses `ng serve` for development

## Prerequisites

- Node.js (v16+ recommended)
- npm
- MongoDB instance (local or Atlas)
- Angular CLI (optional for local dev: `npm i -g @angular/cli`)

## Environment Variables (backend)

Create a `.env` file in `backend/` with at least:

```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<a-strong-secret>
JWT_EXPIRE=7d
PORT=5000
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
```

## Install & Run (Backend)

1. Install dependencies:

```bash
cd backend
npm install
```

2. Seed example data (optional):

```bash
npm run seed
```

3. Start the server:

- Production: `npm start` (runs `node server.js`)
- Development: `npm run dev` (runs `nodemon server.js`)

The backend listens on `PORT` (default `5000`) and exposes endpoints under `/api/*`.

## Install & Run (Frontend)

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm start
```

This runs `ng serve` and serves the app at `http://localhost:4200` by default.

Note: The frontend also includes a convenience `npm run server` script to run a `json-server` mock API (`db.json`) on port `3000` if needed.

## Useful Scripts

Backend (`backend/package.json`):

- `npm start` — start production server
- `npm run dev` — start dev server with `nodemon`
- `npm run seed` — seed example data
- `npm run get-ip` — helper script to log public IP

Frontend (`frontend/package.json`):

- `npm start` — `ng serve` (development)
- `npm run build` — build production assets
- `npm run server` — run `json-server` mock API on port 3000

## Testing

- Backend: No automated tests included by default.
- Frontend: Angular unit tests can be run with `npm test` inside `frontend/`.

## Tips & Next Steps

- Use a hosted MongoDB (Atlas) for easy remote testing; set `MONGODB_URI` accordingly.
- Consider adding `docker-compose` for local dev with MongoDB.
- Add CI and test coverage for backend controllers and frontend components.

---

If you want, I can also:

- Add a sample `.env.example` in `backend/`.
- Create `CONTRIBUTING.md` with development guidelines.
