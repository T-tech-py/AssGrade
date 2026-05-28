import { AdminRequestStatus, PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const adminSeed = {
  email: process.env.SEED_ADMIN_EMAIL?.trim() || 'admin@gradassess.local',
  password: process.env.SEED_ADMIN_PASSWORD?.trim() || 'GradAssessAdmin2026!',
  firstName: process.env.SEED_ADMIN_FIRST_NAME?.trim() || 'Super',
  lastName: process.env.SEED_ADMIN_LAST_NAME?.trim() || 'Admin',
  phone: process.env.SEED_ADMIN_PHONE?.trim() || '+2348000000000',
  school: process.env.SEED_ADMIN_SCHOOL?.trim() || 'GradAssess Operations',
  course: process.env.SEED_ADMIN_COURSE?.trim() || 'Platform Administration',
  level: process.env.SEED_ADMIN_LEVEL?.trim() || 'Admin',
  location: process.env.SEED_ADMIN_LOCATION?.trim() || 'Lagos, Nigeria',
  bio:
    process.env.SEED_ADMIN_BIO?.trim() ||
    'Default seeded administrator account for deployment bootstrap and platform operations.',
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
