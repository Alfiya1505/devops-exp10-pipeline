# ---- Base image ----
# Pinned, slim, official Node LTS image keeps the image small and reproducible.
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies layer ----
# Copying only package*.json first lets Docker cache this layer and skip
# re-running npm install when only source code (not dependencies) changes.
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runtime image ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# Reuse the already-installed production node_modules from the deps layer
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Run as a non-root user (created by the base node image) for security.
USER node

EXPOSE 3000

# Basic container health check hitting our /health endpoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:'+ (process.env.PORT||3000) +'/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]
