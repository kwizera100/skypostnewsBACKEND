import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@skypostnews.com';
  const newPassword = 'Admin@2024!NewPassword';

  console.log('🔑 Resetting admin password...');

  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.error('❌ Admin account not found. Create one first with: npm run admin:setup');
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash: hash },
  });

  console.log('\n✅ Admin password reset successfully!');
  console.log('\n📧 New Admin Credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${newPassword}`);
  console.log('\n⚠️  Login immediately and change this password in settings!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
