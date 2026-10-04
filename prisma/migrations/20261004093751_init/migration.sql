-- OdiaDesk initial database schema and district seed
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT','REVIEW','PUBLISHED','ARCHIVED');
CREATE TYPE "Language" AS ENUM ('ODIA','ENGLISH');

CREATE TABLE "District" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "region" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "District_slug_key" ON "District"("slug");

CREATE TABLE "Article" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "language" "Language" NOT NULL DEFAULT 'ENGLISH',
  "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
  "category" TEXT NOT NULL,
  "sourceName" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "imageUrl" TEXT,
  "districtId" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Article_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Article_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status","publishedAt");
CREATE INDEX "Article_districtId_status_idx" ON "Article"("districtId","status");
CREATE INDEX "Article_category_status_idx" ON "Article"("category","status");

INSERT INTO "District" ("id","name","slug","region","createdAt","updatedAt") VALUES
('district-angul','Angul','angul','Central',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-balangir','Balangir','balangir','Western',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-balasore','Balasore','balasore','Coastal',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-bargarh','Bargarh','bargarh','Western',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-bhadrak','Bhadrak','bhadrak','Coastal',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-boudh','Boudh','boudh','Central',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-cuttack','Cuttack','cuttack','Coastal',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-deogarh','Deogarh','deogarh','Western',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-dhenkanal','Dhenkanal','dhenkanal','Central',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-gajapati','Gajapati','gajapati','Southern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-ganjam','Ganjam','ganjam','Southern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-jagatsinghpur','Jagatsinghpur','jagatsinghpur','Coastal',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-jajpur','Jajpur','jajpur','Coastal',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-jharsuguda','Jharsuguda','jharsuguda','Western',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-kalahandi','Kalahandi','kalahandi','Western',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-kandhamal','Kandhamal','kandhamal','Southern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-kendrapara','Kendrapara','kendrapara','Coastal',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-keonjhar','Keonjhar','keonjhar','Northern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-khordha','Khordha','khordha','Coastal',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-koraput','Koraput','koraput','Southern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-malkangiri','Malkangiri','malkangiri','Southern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-mayurbhanj','Mayurbhanj','mayurbhanj','Northern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-nabarangpur','Nabarangpur','nabarangpur','Southern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-nayagarh','Nayagarh','nayagarh','Central',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-nuapada','Nuapada','nuapada','Western',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-puri','Puri','puri','Coastal',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-rayagada','Rayagada','rayagada','Southern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-sambalpur','Sambalpur','sambalpur','Western',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-subarnapur','Subarnapur','subarnapur','Western',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('district-sundargarh','Sundargarh','sundargarh','Northern',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
