import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database contents...\n');
  
  const categories = await prisma.category.findMany();
  console.log(`Categories: ${categories.length}`);
  categories.forEach(c => console.log(`  - ${c.name} (${c.slug})`));
  
  const articles = await prisma.article.findMany();
  console.log(`\nArticles: ${articles.length}`);
  articles.forEach(a => console.log(`  - ${a.title} (${a.slug})`));
  
  const users = await prisma.user.findMany();
  console.log(`\nUsers: ${users.length}`);
  users.forEach(u => console.log(`  - ${u.name} (${u.email})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
