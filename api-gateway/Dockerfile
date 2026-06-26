FROM node:20-alpine AS builder

WORKDIR /app/gateway

COPY api-gateway/package.json ./
RUN npm install

COPY api-gateway/. ./

RUN ./node_modules/.bin/tsc -p tsconfig.json

FROM node:20-alpine AS runner

WORKDIR /app/gateway

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/gateway/package*.json ./
COPY --from=builder /app/gateway/node_modules ./node_modules
COPY --from=builder /app/gateway/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
