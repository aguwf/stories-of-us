##### DEPENDENCIES

FROM --platform=linux/amd64 oven/bun:1 AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Chỉ copy các file cần thiết cho việc cài đặt dependencies
COPY package.json bun.lockb ./

RUN --mount=type=cache,target=/app/.bun \
    if [ -f bun.lockb ]; then bun install --production --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### BUILDER

FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN --mount=type=cache,target=/app/.bun \
    if [ -f bun.lockb ]; then bun run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### RUNNER

FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]