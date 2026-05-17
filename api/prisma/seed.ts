import { PrismaClient, RoleName } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Upsert Roles
  const roles = [
    RoleName.ADMIN,
    RoleName.TEACHER,
    RoleName.STUDENT,
    RoleName.PARENT,
    RoleName.STAFF,
  ];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
  console.log('Roles seeded.');

  // 2. Upsert Admin User
  const adminEmail = 'admin@example.com';
  // Use a default password hash for 'ChangeMe123!' (BCRYPT_ROUNDS=12)
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
    },
  });
  console.log('Admin user seeded.');

  // 3. Attach ADMIN role to Admin User
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.ADMIN },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });
  console.log('Admin role attached to admin user.');

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
