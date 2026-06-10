-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "image_url" TEXT,
    "read_time" INTEGER NOT NULL DEFAULT 1,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "category_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_articles" ("author_id", "category_id", "content", "created_at", "excerpt", "id", "image_url", "published", "published_at", "read_time", "slug", "thumbnail_url", "title", "updated_at") SELECT "author_id", "category_id", "content", "created_at", "excerpt", "id", "image_url", "published", "published_at", "read_time", "slug", "thumbnail_url", "title", "updated_at" FROM "articles";
DROP TABLE "articles";
ALTER TABLE "new_articles" RENAME TO "articles";
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");
CREATE INDEX "articles_category_id_idx" ON "articles"("category_id");
CREATE INDEX "articles_author_id_idx" ON "articles"("author_id");
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at" DESC);
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
