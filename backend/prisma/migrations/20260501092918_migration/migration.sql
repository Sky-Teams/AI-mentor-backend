-- CreateEnum
CREATE TYPE "CitationType" AS ENUM ('BOOK', 'WEBSITE', 'JOURNAL', 'REPORT');

-- CreateTable
CREATE TABLE "BookCitation" (
    "id" TEXT NOT NULL,
    "citationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" JSONB NOT NULL,
    "datePublished" TIMESTAMP(3),
    "publisher" TEXT NOT NULL,
    "page" TEXT,
    "edition" TEXT,
    "volumeNumber" INTEGER,
    "placePublished" TEXT,
    "isbn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteCitation" (
    "id" TEXT NOT NULL,
    "citationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" JSONB NOT NULL,
    "websiteName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "dateAccess" TIMESTAMP(3) NOT NULL,
    "datePublished" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalCitation" (
    "id" TEXT NOT NULL,
    "citationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" JSONB NOT NULL,
    "journalName" TEXT NOT NULL,
    "page" TEXT,
    "volumeNumber" INTEGER,
    "issueNumber" INTEGER,
    "doi" TEXT,
    "datePublished" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCitation" (
    "id" TEXT NOT NULL,
    "citationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" JSONB NOT NULL,
    "datePublished" TIMESTAMP(3),
    "publisher" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "CitationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookCitation_citationId_key" ON "BookCitation"("citationId");

-- CreateIndex
CREATE INDEX "BookCitation_title_idx" ON "BookCitation"("title");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteCitation_citationId_key" ON "WebsiteCitation"("citationId");

-- CreateIndex
CREATE INDEX "WebsiteCitation_title_idx" ON "WebsiteCitation"("title");

-- CreateIndex
CREATE UNIQUE INDEX "JournalCitation_citationId_key" ON "JournalCitation"("citationId");

-- CreateIndex
CREATE INDEX "JournalCitation_title_idx" ON "JournalCitation"("title");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCitation_citationId_key" ON "ReportCitation"("citationId");

-- CreateIndex
CREATE INDEX "ReportCitation_title_idx" ON "ReportCitation"("title");

-- CreateIndex
CREATE INDEX "Citation_userId_createdAt_idx" ON "Citation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Citation_type_idx" ON "Citation"("type");

-- CreateIndex
CREATE INDEX "Citation_type_createdAt_idx" ON "Citation"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "BookCitation" ADD CONSTRAINT "BookCitation_citationId_fkey" FOREIGN KEY ("citationId") REFERENCES "Citation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteCitation" ADD CONSTRAINT "WebsiteCitation_citationId_fkey" FOREIGN KEY ("citationId") REFERENCES "Citation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalCitation" ADD CONSTRAINT "JournalCitation_citationId_fkey" FOREIGN KEY ("citationId") REFERENCES "Citation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCitation" ADD CONSTRAINT "ReportCitation_citationId_fkey" FOREIGN KEY ("citationId") REFERENCES "Citation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
