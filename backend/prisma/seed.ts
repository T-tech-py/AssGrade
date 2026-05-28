import { AdminRequestStatus, PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const adminSeed = {
  email: 'admin@gradassess.local',
  password: 'GradAssessAdmin2026!',
  firstName: 'Super',
  lastName: 'Admin',
  phone: '+2348000000000',
  school: 'GradAssess Operations',
  course: 'Platform Administration',
  level: 'Admin',
  location: 'Lagos, Nigeria',
  bio: 'Default seeded administrator account for local development.',
};

async function main() {
  const passwordHash = await argon2.hash(adminSeed.password);

  const admin = await prisma.user.upsert({
    where: { email: adminSeed.email },
    update: {
      passwordHash,
      firstName: adminSeed.firstName,
      lastName: adminSeed.lastName,
      role: UserRole.ADMIN,
      adminRequestStatus: AdminRequestStatus.APPROVED,
      isActive: true,
      phone: adminSeed.phone,
      school: adminSeed.school,
      course: adminSeed.course,
      level: adminSeed.level,
      location: adminSeed.location,
      bio: adminSeed.bio,
    },
    create: {
      email: adminSeed.email,
      passwordHash,
      firstName: adminSeed.firstName,
      lastName: adminSeed.lastName,
      role: UserRole.ADMIN,
      adminRequestStatus: AdminRequestStatus.APPROVED,
      isActive: true,
      phone: adminSeed.phone,
      school: adminSeed.school,
      course: adminSeed.course,
      level: adminSeed.level,
      location: adminSeed.location,
      bio: adminSeed.bio,
    },
  });

  await prisma.userSettings.upsert({
    where: { userId: admin.id },
    update: {
      studyGoal: 'Oversee assessment quality, certification integrity, and platform operations.',
    },
    create: {
      userId: admin.id,
      studyGoal: 'Oversee assessment quality, certification integrity, and platform operations.',
    },
  });

  console.log('Seeded admin account:');
  console.log(`Email: ${adminSeed.email}`);
  console.log(`Password: ${adminSeed.password}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed admin account.');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
