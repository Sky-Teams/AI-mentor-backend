import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ParaphrasePanel } from "../components/ParaphrasePanel";
import { ReviewLayout } from "../components/ReviewLayout";
import { ReviewPanel } from "../components/ReviewPanel";
import { SectionChecklistPanel } from "../components/SectionChecklistPanel";
import { projectsApi } from "../services/api/projects";
import { reviewsApi } from "../services/api/reviews";
import type { ProjectSection, ReviewRun, SectionContent } from "../types/api";
import type {
  CreateReferenceInput,
  Reference,
} from "../services/api/reference";
import { referenceApi } from "../services/api/reference";
import { InlineCitationModal } from "../components/InlineCitationModal";

export const SectionEditorPage = () => {
  const { projectId = "", sectionKey = "" } = useParams();
  const navigate = useNavigate();

  // Basic state
  const [section, setSection] = useState<ProjectSection | null>(null);
  const [allSections, setAllSections] = useState<ProjectSection[]>([]);
  const [reviews, setReviews] = useState<ReviewRun[]>([]);
  const [content, setContent] = useState<SectionContent>({
    text: "",
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [sectionId, setSectionId] = useState("");
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [citationOpen, setCitationOpen] = useState(false);

  // Load all data (project + current section + reviews)
  const loadData = async (options?: { preserveContent?: boolean }) => {
    setError("");
    const [project, currentSection, allReviews] = await Promise.all([
      projectsApi.get(projectId),
      projectsApi.getSection(projectId, sectionKey),
      reviewsApi.listProjectReviews(projectId),
    ]);

    setSection(currentSection);
    setSectionId(currentSection.id);
    if (!options?.preserveContent) {
      setContent(currentSection.content);
    }
    setAllSections(project.sections || []);
    setReviews(allReviews);
  };

  useEffect(() => {
    loadData();
  }, [projectId, sectionKey]);

  // Determine navigation list: if viewing a subsection, navigate among siblings;
  // otherwise navigate among root sections.
  const navigationSections = (() => {
    if (section?.parentSectionId) {
      return allSections.filter(
        (s) => s.parentSectionId === section.parentSectionId,
      );
    }
    return allSections.filter((s) => !s.parentSectionId);
  })();

  const currentIndex = navigationSections.findIndex(
    (s) => s.key === sectionKey,
  );
  const prevSection =
    currentIndex > 0 ? navigationSections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < navigationSections.length - 1
      ? navigationSections[currentIndex + 1]
      : null;
  const isLast = currentIndex === navigationSections.length - 1;

  // subsections of current section
  const subsections = useMemo(
    () => allSections.filter((s) => s.parentSectionId === section?.id),
    [allSections, section],
  );

  // Check if user made changes
  const hasUnsavedChanges = section && section.content.text !== content?.text;

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      setError("");
      await projectsApi.updateSection(projectId, sectionKey, {
        content,
        changeSummary: "Updated from internal web UI",
      });
      setStatusMessage("Section saved and versioned.");
      await loadData();
    } catch (error: any) {
      setError(error?.response?.data?.error?.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReview = async () => {
    setIsReviewing(true);
    setStatusMessage(null);
    try {
      setError("");
      await projectsApi.updateSection(projectId, sectionKey, {
        content,
        changeSummary: "Saved before AI review",
      });
      await reviewsApi.triggerReview(projectId, sectionKey);
      setStatusMessage("Review triggered. Refreshing review state...");
      await loadData();
    } catch (error: any) {
      setError(error?.response?.data?.error?.message || "An error occurred.");
    } finally {
      setIsReviewing(false);
    }
  };

  // Navigate to another section (with save check)
  const goToSection = async (targetKey: string) => {
    try {
      setError("");
      if (hasUnsavedChanges) {
        const ok = window.confirm(
          "You have unsaved changes. Save before leaving?",
        );
        if (ok) {
          await projectsApi.updateSection(projectId, sectionKey, {
            content,
            changeSummary: "Saved before navigation",
          });
        }
      }

      navigate(`/projects/${projectId}/sections/${targetKey}`);
      window.scrollTo(0, 0);
    } catch (error: any) {
      setError(error?.response?.data?.error?.message || "An error occurred.");
    }
  };

  const latestSectionReview = useMemo(
    () => reviews.find((r) => r.sectionKey === sectionKey) || null,
    [reviews, sectionKey],
  );

  const countWords = (text: string) => {
    const trimmed = text.trim();
    return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  };

  const referenceSection = allSections.find(
    (item) => item.key === "REFERENCES",
  );
  const projectReferences = referenceSection?.content.references?.items || [];

  const getItemReferenceId = (item: {
    referenceId?: string;
    reference?: { id?: string };
  }): string => item.referenceId ?? item.reference?.id ?? "";

  const addProjectReference = async (item: CreateReferenceInput) => {
    if (!referenceSection)
      throw new Error("References section does not exist.");
    if (
      projectReferences.some(
        (reference) => (reference as any).reference?.doi === item.reference.doi,
      )
    ) {
      alert("This reference already exists in the project.");
      return;
    }
    const [formattedText] = await referenceApi.formatReference({
      references: [item],
      style: "APA",
    });
    const newReferences = [...projectReferences, { ...item, formattedText }];
    await projectsApi.updateSection(projectId, "REFERENCES", {
      content: {
        ...referenceSection.content,
        references: {
          ...referenceSection.content.references,
          items: newReferences,
        },
      },
      changeSummary: "Added reference for inline citation",
    });
    setAllSections((items) =>
      items.map((section) =>
        section.key === "REFERENCES"
          ? {
              ...section,
              content: {
                ...section.content,
                references: {
                  ...section.content.references,
                  items: newReferences,
                },
              },
            }
          : section,
      ),
    );
  };

  // citations are stored as {{cite:refId}} markers in content.text,
  // and swapped for the real formatted text only when shown to the user
  const getShownText = () => {
    const items = content.references?.items || [];
    let text = content.text || "";
    for (const item of items) {
      text = text
        .split(`{{cite:${getItemReferenceId(item)}}}`)
        .join(item.formattedText);
    }

    return text;
  };

  const getRawText = (
    shownText: string,
    items = content.references?.items || [],
  ) => {
    let text = shownText;
    for (const item of items) {
      text = text
        .split(item.formattedText)
        .join(`{{cite:${getItemReferenceId(item)}}}`);
    }
    return text;
  };

  const insertCitation = async (citation: string, reference: Reference) => {
    if (!selection) return;

    const alreadyUsed = projectReferences.some(
      (r) => getItemReferenceId(r) === reference.id,
    );
    if (!alreadyUsed && referenceSection) {
      await addProjectReference({ reference, type: "JOURNAL" });
    }

    const items = content.references?.items || [];
    const alreadyInSection = items.some(
      (r) => getItemReferenceId(r) === reference.id,
    );
    const updatedItems = alreadyInSection
      ? items
      : [...items, { referenceId: reference.id, formattedText: citation }];

    const shown = getShownText();
    const newShown =
      shown.slice(0, selection.end) +
      " " +
      citation +
      shown.slice(selection.end);
    const newText = getRawText(newShown, updatedItems);

    // Insert citation text into the current section and store the reference
    const updatedContent: SectionContent = {
      ...content,
      text: newText,
      references: {
        style: content.references?.style || "APA",
        items: updatedItems,
      },
    };

    setContent(updatedContent);
    setSelection(null);

    // save the updated section to the database
    try {
      setError("");
      await projectsApi.updateSection(projectId, sectionKey, {
        content: updatedContent,
        changeSummary: "Added inline citation",
      });
      setStatusMessage("Citation inserted and saved.");
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Failed to save citation.",
      );
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Section Editor</p>
          <h1>{section?.title ?? sectionKey}</h1>
          <p className="muted-text">
            <Link to={`/projects/${projectId}`}>Back to project</Link>
          </p>
        </div>

        <div className="button-row">
          <button
            className="secondary-button"
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            className="primary-button"
            onClick={handleReview}
            type="button"
            disabled={!content || content.text.length === 0}
          >
            {isReviewing ? "Reviewing..." : "Trigger Review"}
          </button>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {statusMessage ? <p className="success-text">{statusMessage}</p> : null}
      <div className="content-layout">
        <div className="two-column-grid">
          <div className="section-editor__content-shell">
            <div className="card section-editor__content-card">
              <div className="card-header">
                <h3>Content</h3>
                {hasUnsavedChanges && (
                  <span className="badge warning">Unsaved</span>
                )}
              </div>
              <textarea
                style={
                  (section?.maxWords as number) < countWords(content.text || "")
                    ? { border: "1px solid red", outline: "none" }
                    : { outline: "none" }
                }
                className="editor-area"
                onChange={(event) => {
                  setContent((prev) => ({
                    ...prev,
                    text: getRawText(event.target.value),
                  }));
                }}
                onSelect={(event) => {
                  const { selectionStart: start, selectionEnd: end } =
                    event.currentTarget;
                  setSelection(start !== end ? { start, end } : null);
                }}
                rows={10}
                value={getShownText()}
              />
              {selection && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setCitationOpen(true)}
                >
                  Add citation
                </button>
              )}
              <span
                style={{
                  color: "green",
                  fontSize: "12px",
                  backgroundColor: "#f6f7fb",
                }}
                className="badge"
              >
                Max words {section?.maxWords}
              </span>
              <span className="badge" style={{ float: "right" }}>
                {countWords(content.text || "")} Words
              </span>
            </div>

            <div className="section-editor__checklist-divider">
              <SectionChecklistPanel
                section={section}
                projectId={projectId}
                sectionKey={sectionKey}
                onChanged={() => loadData({ preserveContent: true })}
              />
            </div>
          </div>

          <ReviewPanel review={latestSectionReview} />
        </div>
        <ReviewLayout review={latestSectionReview} />
      </div>
      {/* subsections LIST */}
      {subsections.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <h3>subsections</h3>
            <span className="badge">{subsections.length}</span>
          </div>
          <div className="stack">
            {subsections.map((sub) => (
              <Link
                key={sub.id}
                className="section-link"
                to={`/projects/${projectId}/sections/${sub.key}`}
                style={{
                  paddingLeft: "0.75rem",
                  borderLeft: "3px solid #e5e7eb",
                }}
              >
                <div>
                  <strong>{sub.title}</strong>
                  <p className="muted-text">
                    {sub.status} {sub.isOptional ? "· Optional" : ""}
                  </p>
                </div>
                <span>{sub.content.text.trim().length} Words</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <ParaphrasePanel
        sectionId={sectionId}
        content={content.text}
        sectionKey={sectionKey}
        onSaveSuccess={loadData}
      />

      {citationOpen && (
        <InlineCitationModal
          references={projectReferences}
          onAddReference={addProjectReference}
          onClose={() => setCitationOpen(false)}
          onInsert={insertCitation}
        />
      )}
      {/* Navigation buttons */}
      <div
        className="button-row"
        style={{ justifyContent: "space-between", marginTop: "1rem" }}
      >
        <button
          className="secondary-button"
          onClick={() => prevSection && goToSection(prevSection.key)}
          disabled={!prevSection}
          type="button"
        >
          {"\u2190"} Previous
        </button>

        <button
          className="primary-button"
          onClick={() => {
            if (nextSection) {
              goToSection(nextSection.key);
            } else if (isLast) {
              navigate(`/projects/${projectId}`);
            }
          }}
          type="button"
        >
          {isLast ? `Finish ${"\u2192"}` : `Next ${"\u2192"}`}
        </button>
      </div>
      <p className="muted-text">
        Reminder: AI feedback is helpful, but please have a human review it
        before you act on it.
      </p>
    </div>
  );
};
