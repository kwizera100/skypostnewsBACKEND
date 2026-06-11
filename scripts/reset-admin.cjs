// One-off: reset the admin password. Run from the backend app dir on the server.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const EMAIL = 'admin@iremee.com';
const NEW_PASSWORD = 'SkyPost@Admin2026';

(async () => {
  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);
    const user = await prisma.user.update({
      where: { email: EMAIL },
      data: { passwordHash },
      select: { id: true, email: true, role: true },
    });
    console.log('OK reset password for', user.email, '(role', user.role + ')');
  } catch (e) {
    console.error('FAILED:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
