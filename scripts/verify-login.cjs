// Verify the admin password matches what we expect.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const EMAIL = 'admin@iremee.com';
const PASSWORD = 'SkyPost@Admin2026';

(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: EMAIL } });
    if (!user) { console.log('NO USER for', EMAIL); process.exit(1); }
    const ok = await bcrypt.compare(PASSWORD, user.passwordHash);
    console.log('email=' + user.email, 'role=' + user.role, 'passwordMatches=' + ok);
  } finally {
    await prisma.$disconnect();
  }
})();
