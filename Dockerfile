##### DEPENDENCIES

FROM --platform=linux/amd64 oven/bun:1 AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json bun.lockb ./

RUN \
  if [ -f bun.lockb ]; then bun install --production --frozen-lockfile
  else echo "Lockfile not found." && exit 1; \
  fi

##### BUILDER

FROM deps AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f bun.lockb ]; then bun run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### RUNNER

FROM builder AS runner
WORKDIR /app

# Load environment variables from .env
RUN echo ".env" >> .dockerignore && \
    cp .env /app/.env && \
    bun run dotenv -e /app/.env

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]