FROM node:20-alpine AS builder

WORKDIR /app/service

ENV DATABASE_URL="mysql://prisma:prisma123@db:3306/indra_biedaalt"

COPY services/contact-service/package.json ./
RUN npm install

COPY services/contact-service/. ./

RUN npx prisma generate
RUN ./node_modules/.bin/tsc -p tsconfig.json

FROM node:20-alpine AS runner

WORKDIR /app/service

ENV NODE_ENV=production
ENV PORT=3005

COPY --from=builder /app/service/package*.json ./
COPY --from=builder /app/service/node_modules ./node_modules
COPY --from=builder /app/service/dist ./dist
COPY --from=builder /app/service/prisma ./prisma

EXPOSE 3005

CMD ["node", "dist/src/index.js"]
