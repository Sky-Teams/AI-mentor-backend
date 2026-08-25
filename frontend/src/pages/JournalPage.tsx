import { useEffect, useState } from "react";
import { BasicInfoForm } from "../components/journal/BasicInfoForm";
import { SectionForm } from "../components/journal/SectionForm";
import { useJournalForm } from "../hooks/useJournalForm";
import { journalsApi, type JournalSearchResult } from "../services/api/journal";

export const JournalPage = () => {
  const journalForm = useJournalForm();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [journalNameInput, setJournalNameInput] = useState("");
  const [journalMatches, setJournalMatches] = useState<JournalSearchResult[]>(
    [],
  );
  const [isSearchingJournals, setIsSearchingJournals] = useState(false);
  const [loadingJournalId, setLoadingJournalId] = useState<string | null>(null);
  const [journalSearchError, setJournalSearchError] = useState<string | null>(
    null,
  );

  const handleCloseSearchModal = () => {
    setIsGenerateModalOpen(false);
  };

  const handleUseJournal = async (journal: JournalSearchResult) => {
    setLoadingJournalId(journal.id);
    setJournalSearchError(null);

    try {
      const extracted = await journalsApi.extractFromSource({
        journalName: journal.title,
        publisher: journal.publisher?.trim() || undefined,
        url: journal.url,
        issn: journal.issn,
      });
      journalForm.applyExtractedJournal(extracted);
      setIsGenerateModalOpen(false);
      setJournalNameInput("");
      setJournalMatches([]);
    } catch (error: any) {
      setJournalSearchError(
        error?.response?.data?.error?.message ??
          "Could not extract journal data from that source.",
      );
    } finally {
      setLoadingJournalId(null);
    }
  };

  useEffect(() => {
    if (!isGenerateModalOpen) {
      setJournalMatches([]);
      setIsSearchingJournals(false);
      setJournalSearchError(null);
      return;
    }

    const trimmedName = journalNameInput.trim();

    if (trimmedName.length < 2) {
      setJournalMatches([]);
      setJournalSearchError(null);
      setIsSearchingJournals(false);
      return;
    }

    let isActive = true;
    setIsSearchingJournals(true);
    setJournalSearchError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await journalsApi.findByName({
          journalName: trimmedName,
        });

        if (!isActive) return;

        setJournalMatches(results);
      } catch (error: any) {
        if (!isActive) return;

        setJournalMatches([]);
        setJournalSearchError(
          error?.response?.data?.error?.message ??
            "Could not search journals right now.",
        );
      } finally {
        if (isActive) {
          setIsSearchingJournals(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [isGenerateModalOpen, journalNameInput]);

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
            disabled={journalForm.isSubmitting}
            onClick={() => setIsGenerateModalOpen(true)}
            type="button"
          >
            Find Journal
          </button>
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
            <h3 className="journal-ai-modal-title">Find Journal</h3>
            <p className="muted-text journal-ai-modal-description">
              Type a journal name, pick the source, and load its real data.
            </p>
            <input
              className="modern-input journal-ai-modal-input"
              onChange={(event) => setJournalNameInput(event.target.value)}
              placeholder="Type journal name"
              value={journalNameInput}
            />

            <div className="journal-search-results">
              {isSearchingJournals ? (
                <p className="muted-text">Searching journals...</p>
              ) : null}

              {journalSearchError ? (
                <p className="error-text">{journalSearchError}</p>
              ) : null}

              {!isSearchingJournals &&
              !journalSearchError &&
              journalNameInput.trim().length >= 2 &&
              journalMatches.length === 0 ? (
                <p className="muted-text">No journal matches found yet.</p>
              ) : null}

              {journalMatches.map((journal) => (
                <div className="journal-search-result" key={journal.id}>
                  <div className="journal-search-result-top">
                    <button
                      className="secondary-button journal-search-use-button"
                      disabled={loadingJournalId !== null}
                      onClick={() => handleUseJournal(journal)}
                      type="button"
                    >
                      {loadingJournalId === journal.id
                        ? "Loading..."
                        : "Use this journal"}
                    </button>
                    <a
                      className="journal-search-result-title"
                      href={journal.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {journal.title}
                    </a>
                  </div>
                  <a
                    className="journal-search-result-url"
                    href={journal.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {journal.url}
                  </a>
                  <p className="journal-search-result-meta">
                    {journal.publisher}
                    {journal.issn ? ` - ISSN ${journal.issn}` : ""}
                  </p>
                </div>
              ))}
            </div>

            <div className="button-row journal-ai-modal-actions">
              <button
                className="secondary-button"
                disabled={isSearchingJournals}
                onClick={handleCloseSearchModal}
                type="button"
              >
                Cancel
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
