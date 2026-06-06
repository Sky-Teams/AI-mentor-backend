import type { CreateJournalInput } from "../types/api";

// types
export type JournalItemDraft = {
  id: string;
  text: string;
};

export type ChecklistDraft = {
  id: string;
  title: string;
  items: JournalItemDraft[];
};

export type SectionDraft = {
  id: string;
  title: string;
  description: string;
  isOptional: boolean;
  checklists: ChecklistDraft[];
};

export type JournalFormState = {
  name: string;
  publisher: string;
  description: string;
  guidelinePack: string;
  sections: SectionDraft[];
};

// make temporary id
const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// Create empty entities
export const createItem = (): JournalItemDraft => ({
  id: makeId(),
  text: "",
});

export const createChecklist = (): ChecklistDraft => ({
  id: makeId(),
  title: "",
  items: [createItem()],
});

export const createSection = (): SectionDraft => ({
  id: makeId(),
  title: "",
  description: "",
  isOptional: false,
  checklists: [createChecklist()],
});

export const createEmptyJournalForm = (): JournalFormState => ({
  name: "",
  publisher: "",
  description: "",
  guidelinePack: "",
  sections: [createSection()],
});

// Create section key from section title automatically
const makeSectionKey = (title: string, index: number) => {
  const key = title
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return key || `SECTION_${index + 1}`;
};

// backend payload builder
export const buildJournalPayload = (
  form: JournalFormState,
): CreateJournalInput => ({
  name: form.name.trim(),
  publisher: form.publisher.trim() || undefined,
  description: form.description.trim() || undefined,
  manuscriptType: "CASE_REPORT",
  guidelinePack: form.guidelinePack.trim(),
  sections: form.sections.map((section, sectionIndex) => ({
    key: makeSectionKey(section.title, sectionIndex),
    title: section.title.trim(),
    description: section.description.trim() || undefined,
    sectionOrder: sectionIndex + 1,
    isOptional: section.isOptional,
    checklists: section.checklists.map((checklist) => ({
      title: checklist.title.trim() || null,
      items: checklist.items
        .map((item) => item.text.trim())
        .filter((item) => item.length > 0),
    })),
  })),
});

// Validation
export const journalPayloadHasEmptyNestedFields = (
  payload: CreateJournalInput,
) =>
  payload.sections.some(
    (section) =>
      !section.title ||
      section.checklists.length === 0 ||
      section.checklists.some((checklist) => checklist.items.length === 0),
  );

// counters
export const countJournalChecklists = (sections: SectionDraft[]) =>
  sections.reduce((sum, section) => sum + section.checklists.length, 0);

export const countJournalItems = (sections: SectionDraft[]) =>
  sections.reduce(
    (sum, section) =>
      sum +
      section.checklists.reduce(
        (checklistSum, checklist) => checklistSum + checklist.items.length,
        0,
      ),
    0,
  );
