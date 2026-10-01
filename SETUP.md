# Setup Guide — Learning Node.js Through This Project

This walks through the *why*, not just the *how*, for each part of the
project: structure, dependencies, compiling/running, testing, building,
and deploying.

---

## 1. Install Node.js

Download the LTS version from [nodejs.org](https://nodejs.org/) or use
a version manager like `nvm`:

```bash
nvm install 20
nvm use 20
node -v      # confirm it's installed
npm -v       # npm ships bundled with Node.js
```

`node` runs JavaScript outside a browser. `npm` (Node Package Manager)
installs and manages third-party code ("packages"/"dependencies").

---

## 2. Understand `package.json`

Open `package.json`. It's the manifest of the project:

- **`dependencies`** — packages your app needs *at runtime* to function
  (e.g. `express` — the web framework this API is built on).
- **`devDependencies`** — packages only needed *while developing/testing*,
  never shipped or needed in production (e.g. `jest` for testing,
  `nodemon` for auto-restart, `eslint` for linting).
- **`scripts`** — shortcuts you run with `npm run <name>` (see the table
  in README.md).
- **`engines`** — the Node.js version this project expects.

## 3. Install dependencies

```bash
npm install
```

This reads `package.json`, downloads every listed package from the
[npm registry](https://www.npmjs.com/) into a local `node_modules/`
folder, and writes/updates `package-lock.json` — an exact, reproducible
record of every installed version (including sub-dependencies). Commit
`package-lock.json` to git, but **never commit `node_modules/`** (see
`.gitignore`) — it's regenerated from the lock file on any machine.

### Adding a new dependency later

```bash
npm install axios          # adds to "dependencies"
npm install -D eslint       # adds to "devDependencies"
```

### Removing one

```bash
npm uninstall axios
```

---

## 4. Project structure — where things go

Node.js/Express doesn't force a folder structure on you (unlike some
frameworks), but this "layered" convention is extremely common:

| Folder | Responsibility |
|---|---|
| `src/routes/` | Maps a URL + HTTP verb to a controller function. No logic here. |
| `src/controllers/` | Reads the request, calls the model, shapes the response. |
| `src/models/` | Talks to the data store (a database in a real app). |
| `src/middleware/` | Functions that run before/around requests (auth, error handling, logging). |
| `src/app.js` | Wires everything into one Express app instance. |
| `src/index.js` | The actual entry point — loads config and starts listening on a port. |
| `tests/` | Automated tests, mirroring the `src/` structure. |

`app.js` and `index.js` are split on purpose: `app.js` exports the
Express app *without* starting a server, so tests can import and hit it
directly (via Supertest) without binding a real network port.

---

## 5. "Compiling" — is there a build step?

Plain Node.js (like this project) has **no compile step** — it runs
`.js` files directly with the `node` interpreter. That's why:

```bash
npm start        # just runs: node src/index.js
```

If you later add **TypeScript**, you *would* add a compile step
(`tsc`) that transpiles `.ts` → `.js` into a `dist/` folder before
running. This project stays in plain JavaScript to keep the concept
count low — but the same folder structure applies either way.

---

## 6. Running the app

```bash
npm run dev     # development: auto-restarts on file changes (nodemon)
npm start        # production-style: plain `node`, no auto-restart
```

Environment variables (like `PORT`) are loaded from a `.env` file via
the `dotenv` package. Copy the template first:

```bash
cp .env.example .env
```

`.env` is git-ignored on purpose — it often holds secrets (API keys,
DB passwords) that must never be committed.

---

## 7. Testing

```bash
npm test
```

This project uses:
- **Jest** — the test runner and assertion library (`expect(...).toBe(...)`).
- **Supertest** — sends simulated HTTP requests directly to the
  exported Express app, so tests are fast and don't need a live server.

Look at `tests/users.test.js`: each `describe` block groups tests for
one route; each `it(...)` is one scenario (happy path, then edge
cases like "not found" or "missing field"). This is the standard shape
for API tests in Node.js.

Run `npm test` after every change — that's the whole point of having
them. `npm run test:watch` re-runs automatically as you edit.

---

## 8. Linting

```bash
npm run lint
```

ESLint catches common bugs and style issues (unused variables, etc.)
before they become runtime errors. Most teams run this in CI on every
pull request, and often via an editor plugin as you type.

---

## 9. Building & running a Docker image

Docker packages the app *and* everything it needs (Node.js runtime,
dependencies, OS libraries) into one portable image, so "works on my
machine" becomes "works anywhere Docker runs."

```bash
docker build -t nodejs-sample-api .
docker run -p 3000:3000 nodejs-sample-api
curl http://localhost:3000/health
```

What the `Dockerfile` does, step by step:

1. Starts from `node:20-alpine` — a small, official, security-patched
   base image.
2. Copies only `package*.json` first and runs `npm ci --omit=dev`
   — installing *exact, production-only* dependencies. Copying just
   these files first (before the rest of the source) lets Docker cache
   this (often slow) layer, so rebuilds after a source-code change are
   fast.
3. Copies the rest of the source code in.
4. Switches to a **non-root `node` user** — running containers as root
   is a common security mistake.
5. Declares a `HEALTHCHECK` hitting `/health`, so orchestrators
   (Docker, Kubernetes, ECS) can detect if the app is actually healthy,
   not just "the process exists."

Or, with Docker Compose (handles the `build` + `run` + port-mapping in
one command, and is easy to extend with a database service later):

```bash
docker compose up --build
```

---

## 10. Deploying to a server

Three common paths, roughly in order of complexity:

### Option A — Plain VPS (e.g. a $5 DigitalOcean/EC2 box)

1. SSH into the server, install Node.js.
2. `git clone` your repo, `npm ci --omit=dev`, `.env` with real values.
3. Run it with a **process manager** so it survives reboots/crashes,
   e.g. [`pm2`](https://pm2.keymetrics.io/):
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name nodejs-sample-api
   pm2 save && pm2 startup   # restart automatically on server reboot
   ```
4. Put a reverse proxy (Nginx/Caddy) in front for TLS and to map port
   80/443 → your app's port.

### Option B — Any Docker-capable host (recommended, most portable)

Build the image, push it to a registry, then pull + run it on the
server:

```bash
docker build -t <your-registry>/nodejs-sample-api:1.0.0 .
docker push <your-registry>/nodejs-sample-api:1.0.0

# on the server:
docker pull <your-registry>/nodejs-sample-api:1.0.0
docker run -d -p 3000:3000 --restart unless-stopped \
  --env-file .env <your-registry>/nodejs-sample-api:1.0.0
```

This same image works unchanged on Docker Compose, Kubernetes,
AWS ECS/Fargate, Google Cloud Run, Azure Container Apps, Fly.io,
Railway, Render, etc. — that portability is the main reason to
containerize in the first place.

---

## 11. Suggested learning path from here

1. Read through `src/app.js` top to bottom — it's the whole request
   pipeline in ~40 lines.
2. Add a new field to a user (e.g. `age`) end-to-end: model → controller
   → a new test → confirm `npm test` passes.
3. Add a new resource (e.g. `posts`) by copying the `users` pattern.
4. Swap the in-memory model for a real database.
5. Add input validation with `zod` or `joi`.
