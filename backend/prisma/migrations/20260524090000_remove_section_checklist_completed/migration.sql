-- Drop deprecated checklist group completion flag.
-- Completion is now derived from per-section per-item checks in `section_checklist_item_checks`.
ALTER TABLE "journal_section_checklist_groups" DROP COLUMN IF EXISTS "completed";

