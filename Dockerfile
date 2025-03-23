# -------
# Builder
# -------

FROM node:22.12-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package.json first for better layer caching
COPY ./package.json ./

# Copy source code and configuration files
COPY ./src ./src
COPY ./tsconfig.json ./

# default configuration
COPY ./config.secured.jsonc ./

# Install dependencies
RUN npm install
RUN npm ci --ignore-scripts --omit-dev

# Build the application
RUN npm run build

# -------
# Release
# -------

FROM node:22-alpine AS release

# Create app directory
WORKDIR /app

# Copy files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config.secured.jsonc ./
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

# environment variables for injecting via docker run command
# ENV API_KEY=
# ENV HOST=
# ENV PORT=

ENTRYPOINT ["node", "dist/cli.js"]