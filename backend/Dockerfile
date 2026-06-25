FROM node:20-alpine AS builder

WORKDIR /app/backend

ENV DATABASE_URL="mysql://prisma:prisma123@db:3306/indra_biedaalt"

COPY backend/package.json ./
RUN npm install

COPY backend/. ./
COPY Indra/dist ./frontend-dist

RUN npx prisma generate
RUN ./node_modules/.bin/tsc -p tsconfig.json

FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_DIST_DIR=/app/frontend-dist

COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /app/backend/frontend-dist /app/frontend-dist

RUN chmod +x /app/backend/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/backend/docker-entrypoint.sh"]
