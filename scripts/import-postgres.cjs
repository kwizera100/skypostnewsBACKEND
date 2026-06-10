/**
 * One-time import of data-export.json into the Postgres database via Prisma.
 * Run on the server (after `npx prisma db push`):
 *   node scripts/import-postgres.cjs
 * Requires DATABASE_URL pointing to Postgres.
 */
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const dataPath = path.join(__dirname, '..', 'data-export.json');

const toBool = (v) => v === true || v === 1 || v === '1';
const toDate = (v) => (v ? new Date(v) : null);

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Importing ${data.users.length} users, ${data.categories.length} categories, ${data.articles.length} articles...`);

  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.password_hash,
        role: u.role,
        createdAt: toDate(u.created_at) ?? new Date(),
        updatedAt: toDate(u.updated_at) ?? new Date(),
      },
    });
  }

  for (const c of data.categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
        color: c.color ?? '#DC2626',
        createdAt: toDate(c.created_at) ?? new Date(),
      },
    });
  }

  for (const a of data.articles) {
    await prisma.article.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        thumbnailUrl: a.thumbnail_url ?? null,
        imageUrl: a.image_url ?? null,
        readTime: a.read_time ?? 1,
        published: toBool(a.published),
        publishedAt: toDate(a.published_at),
        views: a.views ?? 0,
        createdAt: toDate(a.created_at) ?? new Date(),
        updatedAt: toDate(a.updated_at) ?? new Date(),
        categoryId: a.category_id,
        authorId: a.author_id,
      },
    });
  }

  // Reset Postgres sequences so new inserts don't collide with imported IDs
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX(id) FROM "users"), 1));`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"categories"', 'id'), COALESCE((SELECT MAX(id) FROM "categories"), 1));`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"articles"', 'id'), COALESCE((SELECT MAX(id) FROM "articles"), 1));`);

  console.log('Import complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
