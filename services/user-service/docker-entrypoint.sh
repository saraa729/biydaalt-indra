#!/bin/sh
npx prisma migrate deploy
exec node dist/src/index.js
