import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

declare global {
  // Reuse a single Prisma client in development to avoid exhausting connections.
  // The generated Prisma typings in this repo are currently out of sync with the schema,
  // so we keep the shared client typed loosely until the client can be regenerated.
  var prisma: any;
}

const prisma: any = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
