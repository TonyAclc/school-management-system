import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.class.findMany({
    include: {
      homeroomTeacher: {
        include: { user: true }
      }
    }
  });
  console.dir(classes, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
