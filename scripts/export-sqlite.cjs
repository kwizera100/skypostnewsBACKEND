/**
 * One-time export of all data from the local SQLite dev.db into data-export.json.
 * Run locally:  node scripts/export-sqlite.cjs
 * Requires:     npm i -D better-sqlite3
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const outPath = path.join(__dirname, '..', 'data-export.json');

const db = new Database(dbPath, { readonly: true });

function all(table) {
  try {
    return db.prepare(`SELECT * FROM ${table}`).all();
  } catch (e) {
    console.warn(`Skipping ${table}: ${e.message}`);
    return [];
  }
}

const data = {
  users: all('users'),
  categories: all('categories'),
  articles: all('articles'),
};

fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

console.log('Exported:');
console.log(`  users:      ${data.users.length}`);
console.log(`  categories: ${data.categories.length}`);
console.log(`  articles:   ${data.articles.length}`);
console.log(`-> ${outPath}`);

db.close();
