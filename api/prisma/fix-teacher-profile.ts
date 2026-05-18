import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'teacher@gmail.com';
  const user = await prisma.user.findUnique({ where: { email }, include: { teacher: true } });
  
  if (user && !user.teacher) {
    await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeNumber: 'TCH-001',
        department: 'BSIT'
      }
    });
    console.log(`Created teacher profile for ${email}`);
  } else if (user?.teacher) {
    console.log(`Teacher profile already exists for ${email}`);
  } else {
    console.log(`User ${email} not found.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
