import { BasicInfoForm } from "../components/journal/BasicInfoForm";
import { SectionForm } from "../components/journal/SectionForm";
import { useJournalForm } from "../hooks/useJournalForm";

export const JournalPage = () => {
  const journalForm = useJournalForm();

  return (
    <form className="page-shell journal-page" onSubmit={journalForm.submitJournal}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Journal</p>
          <h1>Create Journal</h1>
          <p className="muted-text">
            Build a journal template with sections, checklists, and items.
          </p>
        </div>
        <button
          className="primary-button"
          disabled={
            journalForm.isSubmitting ||
            journalForm.isLoadingSpecialties ||
            journalForm.specialties.length === 0
          }
          type="submit"
        >
          {journalForm.isSubmitting ? "Creating..." : "Create Journal"}
        </button>
      </div>

      {journalForm.message ? (
        <p className="success-text">{journalForm.message}</p>
      ) : null}
      {journalForm.error ? (
        <p className="error-text">{journalForm.error}</p>
      ) : null}

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
