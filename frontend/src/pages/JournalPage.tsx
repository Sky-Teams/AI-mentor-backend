import { useState } from "react";
import { BasicInfoForm } from "../components/journal/BasicInfoForm";
import { SectionForm } from "../components/journal/SectionForm";
import { useJournalForm } from "../hooks/useJournalForm";

export const JournalPage = () => {
  const journalForm = useJournalForm();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [journalNameInput, setJournalNameInput] = useState("");

  const handleGenerateFromName = async () => {
    const trimmedName = journalNameInput.trim();

    if (!trimmedName) {
      return;
    }

    await journalForm.generateFromName(trimmedName);
    setJournalNameInput("");
    setIsGenerateModalOpen(false);
  };

  const handleAddSection = () => {
    journalForm.addSection();
    setTimeout(() => {
      const sections =
        document.querySelectorAll<HTMLElement>(".journal-section");
      sections[sections.length - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  return (
    <form
      className="page-shell journal-page"
      onSubmit={journalForm.submitJournal}
    >
      <div className="page-header">
        <div>
          <p className="eyebrow">Journal</p>
          <h1>Create Journal</h1>
          <p className="muted-text">
            Build a journal template with sections, checklists, and items.
          </p>
        </div>
        <div className="button-row">
          <button
            className="secondary-button"
            disabled={journalForm.isGenerating || journalForm.isSubmitting}
            onClick={() => setIsGenerateModalOpen(true)}
            type="button"
          >
            {journalForm.isGenerating
              ? "Generating..."
              : "Create Journal with AI"}
          </button>
          <button
            className="primary-button"
            disabled={
              journalForm.isSubmitting ||
              journalForm.isGenerating ||
              journalForm.isLoadingSpecialties ||
              journalForm.specialties.length === 0
            }
            type="submit"
          >
            {journalForm.isSubmitting ? "Creating..." : "Create Journal"}
          </button>
        </div>
      </div>

      {isGenerateModalOpen ? (
        <div
          className="journal-ai-modal-backdrop"
          onClick={() => setIsGenerateModalOpen(false)}
        >
          <div
            className="journal-ai-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="journal-ai-modal-title">Create Journal with AI</h3>
            <p className="muted-text journal-ai-modal-description">
              Enter a journal name and generate the structure from it.
            </p>
            <input
              className="modern-input journal-ai-modal-input"
              onChange={(event) => setJournalNameInput(event.target.value)}
              placeholder="Type journal name"
              value={journalNameInput}
            />
            <div className="button-row journal-ai-modal-actions">
              <button
                className="secondary-button"
                disabled={journalForm.isGenerating}
                onClick={() => setIsGenerateModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="primary-button"
                disabled={!journalNameInput.trim() || journalForm.isGenerating}
                onClick={handleGenerateFromName}
                type="button"
              >
                {journalForm.isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
            onClick={handleAddSection}
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
