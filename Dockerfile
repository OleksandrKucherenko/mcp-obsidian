# -------
# Builder
# -------

FROM node:22.12-alpine AS builder

# source code
COPY ./src /app
# typescript configuration required for building
COPY ./tsconfig.json /tsconfig.json
# default configuration
COPY ./config.secured.jsonc /config.secured.jsonc 

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm npm install
RUN --mount=type=cache,target=/root/.npm-production npm ci --ignore-scripts --omit-dev

# -------
# Release
# -------

FROM node:22-alpine AS release

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/config.secured.jsonc /app/config.secured.jsonc
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

ENV NODE_ENV=production

# environment variables for injecting via docker run command
ENV API_KEY=
ENV HOST=
ENV PORT=

WORKDIR /app

RUN npm ci --ignore-scripts --omit-dev

ENTRYPOINT ["node", "dist/index.js"]