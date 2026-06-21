import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Setting up admin account...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@skypostnews.com' },
  });

  if (existingAdmin) {
    console.log('✅ Admin account already exists');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log('   To reset the password, run: npm run admin:reset-password');
    return;
  }

  // Create admin user with default password
  const defaultPassword = 'Admin@2024!Secure';
  const hash = await bcrypt.hash(defaultPassword, 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Sky Post Admin',
      email: 'admin@skypostnews.com',
      passwordHash: hash,
      role: 'ADMIN',
    },
  });

  console.log('\n✅ Admin account created successfully!');
  console.log('\n📧 Admin Credentials:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${defaultPassword}`);
  console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!');
  console.log('   Login at: /admin');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
