# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# bcrypt needs to be recompiled here after installation, otherwise it ends up missing
RUN npm install -g pnpm@10.2 @mapbox/node-pre-gyp@1.0.11 && pnpm i --frozen-lockfile && cd node_modules/bcrypt && node-pre-gyp install --fallback-to-build


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Package lock is not necessary for building, and the scripts from package.json can be run by npm in the same way as by pnpm
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env
# Drizzle migrations, to be applied at startup
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

USER nextjs

ENV HOSTNAME="0.0.0.0"
CMD node server.js