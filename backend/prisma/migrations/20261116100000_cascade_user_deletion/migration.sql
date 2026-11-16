ALTER TABLE "SectionVersion"
DROP CONSTRAINT "SectionVersion_editedById_fkey",
ADD CONSTRAINT "SectionVersion_editedById_fkey"
FOREIGN KEY ("editedById") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewRun"
DROP CONSTRAINT "ReviewRun_initiatedById_fkey",
ADD CONSTRAINT "ReviewRun_initiatedById_fkey"
FOREIGN KEY ("initiatedById") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ParaphraseRun"
DROP CONSTRAINT "ParaphraseRun_initiatedById_fkey",
ADD CONSTRAINT "ParaphraseRun_initiatedById_fkey"
FOREIGN KEY ("initiatedById") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
