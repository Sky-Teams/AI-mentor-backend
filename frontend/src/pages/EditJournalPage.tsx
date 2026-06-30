import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BasicInfoForm } from "../components/journal/BasicInfoForm";
import { SectionForm } from "../components/journal/SectionForm";
import { useJournalForm } from "../hooks/useJournalForm";
import { journalsApi } from "../services/api/journal";
import { adminApi } from "../services/api/admin";
import {
  mapJournalToFormState,
  buildUpdateJournalPayload,
  type JournalFormState,
} from "../utils/journalForm";

export const EditJournalPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const journalForm = useJournalForm();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const j = await journalsApi.getById(id);

        // map journal into JournalFormState
        const formState = mapJournalToFormState(j);
        journalForm.updateSections(formState.sections);
        journalForm.updateBasicInfo("name", formState.name);
        journalForm.updateBasicInfo("publisher", formState.publisher);
        journalForm.updateBasicInfo("description", formState.description);
        journalForm.updateBasicInfo("guidelinePack", formState.guidelinePack);
        journalForm.updateBasicInfo("specialtyId", formState.specialtyId);
      } catch (err: any) {
        setLoadError(
          err?.response?.data?.error?.message ||
            "Could not load journal. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const buildUpdatePayload = (form: JournalFormState) =>
    buildUpdateJournalPayload(form);

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    try {
      const payload = buildUpdatePayload(journalForm.form);
      await adminApi.updateJournal(id, payload);
      setSaveSuccess("Journal updated successfully.");
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.error?.message || "Could not update journal",
      );
    }
  };

  return (
    <form className="page-shell journal-page" onSubmit={handleUpdate}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Journal</p>
          <h1>Edit Journal</h1>
          <p className="muted-text">Update an existing journal template.</p>
        </div>
        <button className="primary-button" disabled={loading} type="submit">
          Update Journal
        </button>
      </div>

      {saveSuccess ? <p className="success-text">{saveSuccess}</p> : null}
      {saveError ? <p className="error-text">{saveError}</p> : null}
      {loadError ? <p className="error-text">{loadError}</p> : null}

      <BasicInfoForm
        form={journalForm.form}
        isLoadingSpecialties={journalForm.isLoadingSpecialties}
        onChange={journalForm.updateBasicInfo}
        specialties={journalForm.specialties}
      />

      <section className="card journal-card">
        <div className="card-header">
          <div>
            <h3>Sections</h3>
            <p className="muted-text">
              {journalForm.form.sections.length} sections,{" "}
              {journalForm.totalChecklistCount} checklists,{" "}
              {journalForm.totalItemCount} items
            </p>
          </div>
          <button
            className="secondary-button"
            onClick={journalForm.addSection}
            type="button"
          >
            + Add Section
          </button>
        </div>

        <div className="journal-section-list">
          {journalForm.form.sections.map((section, sectionIndex) => (
            <SectionForm
              key={section.id}
              onAddChecklist={() => journalForm.addChecklist(section)}
              onAddItem={(checklist) => journalForm.addItem(section, checklist)}
              onRemove={() => journalForm.removeSection(section.id)}
              onRemoveChecklist={(checklistId) =>
                journalForm.removeChecklist(section, checklistId)
              }
              onUpdate={(nextSection) =>
                journalForm.updateSection(section.id, nextSection)
              }
              onUpdateChecklist={(checklistId, nextChecklist) =>
                journalForm.updateChecklist(section, checklistId, nextChecklist)
              }
              section={section}
              sectionCount={journalForm.form.sections.length}
              sectionIndex={sectionIndex}
            />
          ))}
        </div>
      </section>
    </form>
  );
};

export default EditJournalPage;
