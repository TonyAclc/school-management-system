import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true }
  });
  console.dir(teachers, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
