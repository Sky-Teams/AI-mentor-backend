-- CreateTable
CREATE TABLE "section_checklist_item_checks" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "itemIndex" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_checklist_item_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "section_checklist_item_checks_sectionId_idx" ON "section_checklist_item_checks"("sectionId");

-- CreateIndex
CREATE INDEX "section_checklist_item_checks_checklistId_idx" ON "section_checklist_item_checks"("checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "section_checklist_item_checks_sectionId_checklistId_itemInd_key" ON "section_checklist_item_checks"("sectionId", "checklistId", "itemIndex");

-- AddForeignKey
ALTER TABLE "section_checklist_item_checks" ADD CONSTRAINT "section_checklist_item_checks_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ProjectSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_checklist_item_checks" ADD CONSTRAINT "section_checklist_item_checks_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "journal_section_checklist_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
