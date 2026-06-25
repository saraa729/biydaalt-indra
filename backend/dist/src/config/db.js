import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? '');
const prisma = globalThis.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
export default prisma;
