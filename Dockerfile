# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# bcrypt needs to be recompiled here after installation, otherwise it causes issues related to native bindings
RUN npm install -g pnpm@10.2 && pnpm fetch && pnpm install --frozen-lockfile --offline

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY drizzle ./drizzle
COPY public ./public
COPY src ./src
COPY .env next.config.mjs package.json postcss.config.mjs tailwind.config.ts tsconfig.json ./
ENV NEXT_TELEMETRY_DISABLED=1
# Package lock is not necessary for building, and the scripts from package.json can be run by npm in the same way as by pnpm
RUN npm run build:prod

# Production image, copy the build and run the Next.js server on startup
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Drizzle migrations, to be applied at startup
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
USER nextjs
ENV HOSTNAME="0.0.0.0"
CMD node server.js