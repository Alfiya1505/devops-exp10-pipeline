# Node.js Sample API

A deliberately small Express.js REST API, built so you can see — in one
place — how a typical Node.js backend project is put together: folder
structure, dependency management, testing, building, and deployment
with Docker.

It's a simple "Users" CRUD API backed by an in-memory array (no real
database needed to run it).

> New to this project? Start with **[SETUP.md](./SETUP.md)** for a
> step-by-step walkthrough of every concept. This README is the
> quick-reference version.

## Project structure

```
nodejs-sample-api/
├── src/
│   ├── index.js              # Entry point — starts the HTTP server
│   ├── app.js                 # Builds the Express app (no server binding — testable)
│   ├── routes/
│   │   └── users.routes.js    # URL → controller mapping
│   ├── controllers/
│   │   └── users.controller.js# Request/response handling logic
│   ├── models/
│   │   └── users.model.js     # Data access layer (swap for a real DB later)
│   └── middleware/
│       └── errorHandler.js    # Centralized 404 + error handling
├── tests/
│   └── users.test.js          # Jest + Supertest API tests
├── Dockerfile                  # Production container image
├── docker-compose.yml          # Convenience wrapper for `docker run`
├── package.json                # Dependencies + npm scripts
├── jest.config.js              # Test runner config
├── .eslintrc.json               # Lint rules
├── .env.example                 # Template for local environment variables
└── .gitignore / .dockerignore
```

This **layered structure** (routes → controllers → models) is the most
common pattern in small-to-medium Express APIs. As a project grows,
people usually add `services/` (business logic separate from HTTP
concerns) and a real database client in place of `models/users.model.js`.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 LTS or newer (includes `npm`)
- [Docker](https://www.docker.com/) (optional, only needed for containerized run)

## Quick start

```bash
npm install               # install dependencies (reads package.json)
cp .env.example .env      # create your local environment file
npm run dev                # start the API with auto-reload on http://localhost:3000
```

Try it:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/users
```

## npm scripts

| Command          | What it does                                              |
|-------------------|------------------------------------------------------------|
| `npm install`     | Installs everything listed in `package.json`               |
| `npm run dev`     | Runs the API with `nodemon` (auto-restarts on file changes)|
| `npm start`       | Runs the API the way production would (plain `node`)       |
| `npm test`        | Runs the Jest test suite with coverage                     |
| `npm run test:watch` | Re-runs tests automatically as you edit files            |
| `npm run lint`    | Checks code style with ESLint                               |
| `npm run lint:fix`| Auto-fixes lint issues where possible                       |

## Adding a dependency

```bash
npm install <package-name>            # runtime dependency (needed to run the app)
npm install -D <package-name>         # dev dependency (only needed while developing/testing)
```

This updates `package.json` and `package-lock.json` automatically —
always commit both files.

## Running tests

```bash
npm test
```

Tests use **Jest** as the test runner/assertion library and
**Supertest** to send fake HTTP requests to the Express app without
needing a real running server or open port. Coverage output is written
to `coverage/` (git-ignored).

## Building & running with Docker

```bash
docker build -t nodejs-sample-api .
docker run -p 3000:3000 nodejs-sample-api
```

or with Docker Compose:

```bash
docker compose up --build
```

The `Dockerfile` uses `node:20-alpine` (small, secure base image),
installs only production dependencies (`npm ci --omit=dev`), runs as a
non-root `node` user, and defines a container `HEALTHCHECK` against the
`/health` endpoint — all standard production practices.

## API reference

| Method | Path             | Description          |
|--------|------------------|-----------------------|
| GET    | `/health`         | Health check          |
| GET    | `/api/users`      | List all users        |
| GET    | `/api/users/:id`  | Get one user           |
| POST   | `/api/users`      | Create a user (`{name, email}`) |
| PUT    | `/api/users/:id`  | Update a user          |
| DELETE | `/api/users/:id`  | Delete a user          |

## Deploying to a server

See the **"Deploying"** section of [SETUP.md](./SETUP.md) for two
options: plain VPS with `pm2`, or any container host (Docker image).

## Next steps as you learn

- Swap `src/models/users.model.js` for a real database (Postgres +
  [Prisma](https://www.prisma.io/) or MongoDB + [Mongoose](https://mongoosejs.com/) are common starting points).
- Add request validation with a library like [zod](https://zod.dev/) or [joi](https://joi.dev/).
- Add authentication (e.g. JWT-based) as `src/middleware/auth.js`.
- Add structured logging (e.g. [pino](https://getpino.io/)) instead of `morgan`+`console.log`.
