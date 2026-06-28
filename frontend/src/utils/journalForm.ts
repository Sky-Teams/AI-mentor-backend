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
  sectionPrompt: string;
  isOptional: boolean;
  maxChars: string;
  checklists: ChecklistDraft[];
  subsections: SectionDraft[]; // NEW
};

export type JournalFormState = {
  name: string;
  publisher: string;
  description: string;
  guidelinePack: string;
  specialtyId: string;
  sections: SectionDraft[];
};

// make temporary id
const makeTempId = () =>
  `temp-${
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  }`;

const isTempId = (id: string): boolean => id.startsWith("temp-");

const getPayloadId = (id?: string) => (id && !isTempId(id) ? id : undefined);

// Create empty entities
export const createItem = (): JournalItemDraft => ({
  id: makeTempId(),
  text: "",
});

export const createChecklist = (): ChecklistDraft => ({
  id: makeTempId(),
  title: "",
  items: [createItem()],
});

export const createSection = (): SectionDraft => ({
  id: makeTempId(),
  title: "",
  sectionPrompt: "",
  isOptional: false,
  maxChars: "",
  checklists: [createChecklist()],
  subsections: [], // NEW
});

export const createEmptyJournalForm = (): JournalFormState => ({
  name: "",
  publisher: "",
  description: "",
  guidelinePack: "",
  specialtyId: "",
  sections: [createSection()],
});

// backend payload builder
export const buildJournalPayload = (
  form: JournalFormState,
): CreateJournalInput => ({
  name: form.name.trim(),
  publisher: form.publisher.trim() || undefined,
  description: form.description.trim() || undefined,
  manuscriptType: "CASE_REPORT",
  guidelinePack: form.guidelinePack.trim(),
  specialtyId: form.specialtyId,
  sections: form.sections.map((section, sectionIndex) => ({
    title: section.title.trim(),
    sectionPrompt: section.sectionPrompt.trim(),
    sectionOrder: sectionIndex + 1,
    isOptional: section.isOptional,
    maxChars: Number(section.maxChars),
    checklists: section.checklists.map((checklist) => ({
      title: checklist.title.trim() || null,
      items: checklist.items
        .map((item) => item.text.trim())
        .filter((item) => item.length > 0),
    })),
    subsections: section.subsections.map((sub, subIndex) => ({
      title: sub.title.trim(),
      description: sub.sectionPrompt.trim() || undefined,
      sectionOrder: subIndex + 1,
      isOptional: sub.isOptional,
      maxChars: Number(sub.maxChars),
      checklists: sub.checklists
        .map((c) => ({
          title: c.title.trim() || null,
          items: c.items.map((i) => i.text.trim()).filter((i) => i.length > 0),
        }))
        .filter((c) => c.items.length > 0),
    })),
  })),
});

export const buildUpdateJournalPayload = (
  form: JournalFormState,
): Partial<CreateJournalInput> & { sections?: Array<any> } => ({
  name: form.name.trim() || undefined,
  publisher: form.publisher.trim() || undefined,
  description: form.description.trim() || undefined,
  guidelinePack: form.guidelinePack.trim() || undefined,
  specialtyId: form.specialtyId || undefined,
  sections: form.sections.map((section, sectionIndex) => ({
    id: getPayloadId(section.id),
    title: section.title.trim(),
    description: section.description.trim() || undefined,
    sectionOrder: sectionIndex + 1,
    isOptional: section.isOptional,
    maxChars: Number(section.maxChars),
    checklists: section.checklists.map((checklist) => ({
      id: getPayloadId(checklist.id),
      title: checklist.title.trim() || null,
      items: checklist.items
        .map((item) => item.text.trim())
        .filter((item) => item.length > 0),
    })),
    subsections: section.subsections.map((sub, subIndex) => ({
      id: getPayloadId(sub.id),
      title: sub.title.trim(),
      description: sub.description.trim() || undefined,
      sectionOrder: subIndex + 1,
      isOptional: sub.isOptional,
      maxChars: Number(sub.maxChars),
      checklists: sub.checklists.map((c) => ({
        id: getPayloadId(c.id),
        title: c.title.trim() || null,
        items: c.items
          .map((item) => item.text.trim())
          .filter((item) => item.length > 0),
      })),
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
      !section.sectionPrompt ||
      section.sectionPrompt.trim().length === 0 ||
      section.maxChars < 1 ||
      section.checklists.length === 0 ||
      section.checklists.some((checklist) => checklist.items.length === 0),
  );

export const mapJournalToFormState = (journal: any): JournalFormState => ({
  name: journal.name,
  publisher: journal.publisher || "",
  description: journal.description || "",
  guidelinePack: (journal.guidelinePack?.rules?.text as string) || "",
  specialtyId: journal.specialty?.id || "",
  sections: journal.sections?.map((section: any) => ({
    id: section.id,
    title: section.title || "",
    description: section.description || "",
    isOptional: section.isOptional ?? false,
    maxChars: String(section.maxChars ?? ""),
    checklists: (section.checklists || []).map((checklist: any) => ({
      id: checklist.id,
      title: checklist.title || "",
      items: (checklist.items || []).map((item: string) => ({
        id: Math.random().toString(36).slice(2),
        text: item,
      })),
    })),
    subsections:
      section.subsections?.map((sub: any) => ({
        id: sub.id,
        title: sub.title || "",
        description: sub.description || "",
        isOptional: sub.isOptional ?? false,
        maxChars: String(sub.maxChars ?? ""),
        checklists: (sub.checklists || []).map((checklist: any) => ({
          id: checklist.id,
          title: checklist.title || "",
          items: (checklist.items || []).map((item: string) => ({
            id: Math.random().toString(36).slice(2),
            text: item,
          })),
        })),
        subsections: [],
      })) ?? [],
  })) ?? [createSection()],
});

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
