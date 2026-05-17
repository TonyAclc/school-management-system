import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prismaInstance?: PrismaClient };

const buildPrismaClient = () => new PrismaClient({
  log: ['warn', 'error'],
  errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
});

export const prisma: PrismaClient =
  globalForPrisma.prismaInstance ?? buildPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaInstance = prisma;
}

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
