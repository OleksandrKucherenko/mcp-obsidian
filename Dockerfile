FROM node:22.12-alpine AS base
WORKDIR /app

# -------
# Builder
# -------

FROM base AS builder

# Copy package.json
# Copy source code and configuration files
# default TS configuration and app configuration
COPY ./package.json ./tsconfig.json ./config.secured.jsonc ./
COPY ./src ./src

# Install dependencies
RUN npm install
RUN npm ci --ignore-scripts --omit-dev

# Build the application
RUN npm run build

# -------
# Release
# -------

FROM base AS release

# Copy files from builder stage
COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/config.secured.jsonc /app/package.json /app/package-lock.json ./

ENV NODE_ENV=production
RUN npm ci --ignore-scripts --omit-dev

# environment variables for injecting via docker run command
# ENV API_KEY=
# ENV HOST=
# ENV PORT=

ENTRYPOINT ["node", "dist/cli.js"]