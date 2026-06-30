import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminApi } from "../services/api/admin";
import type { Specialty } from "../types/api";
import {
  buildJournalPayload,
  countJournalChecklists,
  countJournalItems,
  createChecklist,
  createEmptyJournalForm,
  createItem,
  createSection,
  journalPayloadHasEmptyNestedFields,
  type ChecklistDraft,
  type JournalFormState,
  type SectionDraft,
} from "../utils/journalForm";
import { journalsApi } from "../services/api/journal.js";

export const useJournalForm = () => {
  const [form, setForm] = useState<JournalFormState>(createEmptyJournalForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const specialtyList = await journalsApi.getSpecialties();
        setSpecialties(specialtyList);
        setForm((current) => ({
          ...current,
          specialtyId: current.specialtyId || specialtyList[0]?.id || "",
        }));
      } catch {
        setError("Could not load specialties. Please refresh and try again.");
      } finally {
        setIsLoadingSpecialties(false);
      }
    };

    loadSpecialties();
  }, []);

  const totalChecklistCount = useMemo(
    () => countJournalChecklists(form.sections),
    [form.sections],
  );

  const totalItemCount = useMemo(
    () => countJournalItems(form.sections),
    [form.sections],
  );

  const updateBasicInfo = (
    field: keyof Omit<JournalFormState, "sections">,
    value: string,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSections = (sections: SectionDraft[]) => {
    setForm((current) => ({ ...current, sections }));
  };

  const updateSection = (sectionId: string, nextSection: SectionDraft) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? nextSection : section,
      ),
    }));
  };

  const addSection = () => {
    setForm((current) => ({
      ...current,
      sections: [...current.sections, createSection()],
    }));
  };

  const removeSection = (sectionId: string) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const addChecklist = (section: SectionDraft) => {
    updateSection(section.id, {
      ...section,
      checklists: [...section.checklists, createChecklist()],
    });
  };

  const removeChecklist = (section: SectionDraft, checklistId: string) => {
    updateSection(section.id, {
      ...section,
      checklists: section.checklists.filter(
        (checklist) => checklist.id !== checklistId,
      ),
    });
  };

  const updateChecklist = (
    section: SectionDraft,
    checklistId: string,
    nextChecklist: ChecklistDraft,
  ) => {
    updateSection(section.id, {
      ...section,
      checklists: section.checklists.map((checklist) =>
        checklist.id === checklistId ? nextChecklist : checklist,
      ),
    });
  };

  const addItem = (section: SectionDraft, checklist: ChecklistDraft) => {
    updateChecklist(section, checklist.id, {
      ...checklist,
      items: [...checklist.items, createItem()],
    });
  };

  const resetForm = () => {
    setForm({
      ...createEmptyJournalForm(),
      specialtyId: specialties[0]?.id || "",
    });
  };

  const submitJournal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    const payload = buildJournalPayload(form);

    if (!payload.name || !payload.guidelinePack || !payload.specialtyId) {
      setError("Journal name, specialty, and guideline pack are required.");
      return;
    }

    // Mirrors the backend schema so users get a quick message before submit.
    if (journalPayloadHasEmptyNestedFields(payload)) {
      setError(
        "Each section needs a title, max characters greater than 0, and each checklist needs at least one item.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const journal = await adminApi.createJournal(payload);
      setMessage(`${journal.name} was created.`);
      resetForm();
    } catch (createError: any) {
      setError(
        createError?.response?.data?.error?.message ??
          "Could not create journal. Please check the fields and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addChecklist,
    addItem,
    addSection,
    error,
    form,
    isLoadingSpecialties,
    isSubmitting,
    message,
    removeChecklist,
    removeSection,
    submitJournal,
    specialties,
    totalChecklistCount,
    totalItemCount,
    updateBasicInfo,
    updateChecklist,
    updateSection,
    updateSections,
  };
};
