import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ParaphrasePanel } from "../components/ParaphrasePanel";
import { ReviewLayout } from "../components/ReviewLayout";
import { ReviewPanel } from "../components/ReviewPanel";
import { SectionChecklistPanel } from "../components/SectionChecklistPanel";
import { projectsApi } from "../services/api/projects";
import { reviewsApi } from "../services/api/reviews";
import type { ProjectSection, ReviewRun } from "../types/api";

export const SectionEditorPage = () => {
  const { projectId = "", sectionKey = "" } = useParams();
  const navigate = useNavigate();

  // Basic state
  const [section, setSection] = useState<ProjectSection | null>(null);
  const [allSections, setAllSections] = useState<ProjectSection[]>([]);
  const [reviews, setReviews] = useState<ReviewRun[]>([]);
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [sectionId, setSectionId] = useState("");

  // Load all data (project + current section + reviews)
  const loadData = async (options?: { preserveContent?: boolean }) => {
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

  // Only root sections for prev/next navigation
  const rootSections = allSections.filter((s) => !s.parentSectionId);
  const currentIndex = rootSections.findIndex((s) => s.key === sectionKey);
  const prevSection = currentIndex > 0 ? rootSections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < rootSections.length - 1
      ? rootSections[currentIndex + 1]
      : null;
  const isLast = currentIndex === rootSections.length - 1;

  // subsections of current section
  const subsections = useMemo(
    () => allSections.filter((s) => s.parentSectionId === section?.id),
    [allSections, section],
  );

  // Check if user made changes
  const hasUnsavedChanges = section && section.content !== content;

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await projectsApi.updateSection(projectId, sectionKey, {
        content,
        changeSummary: "Updated from internal web UI",
      });
      setStatusMessage("Section saved and versioned.");
      await loadData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReview = async () => {
    setIsReviewing(true);
    setStatusMessage(null);
    try {
      await projectsApi.updateSection(projectId, sectionKey, {
        content,
        changeSummary: "Saved before AI review",
      });
      await reviewsApi.triggerReview(projectId, sectionKey);
      setStatusMessage("Review triggered. Refreshing review state...");
      await loadData();
    } finally {
      setIsReviewing(false);
    }
  };

  // Navigate to another section (with save check)
  const goToSection = async (targetKey: string) => {
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
  };

  const latestSectionReview = useMemo(
    () => reviews.find((r) => r.sectionKey === sectionKey) || null,
    [reviews, sectionKey],
  );

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
            disabled={content.length === 0}
          >
            {isReviewing ? "Reviewing..." : "Trigger Review"}
          </button>
        </div>
      </div>

      {statusMessage ? <p className="success-text">{statusMessage}</p> : null}

      <div className="content-layout">
        <div className="two-column-grid">
          <div className="section-editor__content-shell">
            <div className="card section-editor__content-card">
              <div className="card-header">
                <h3>Content</h3>
                <span className="badge">{content.length} chars</span>
                {hasUnsavedChanges && (
                  <span className="badge warning">Unsaved</span>
                )}
              </div>
              <textarea
                className="editor-area"
                onChange={(event) => setContent(event.target.value)}
                rows={10}
                value={content}
              />
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
                <span>{sub.content.trim().length} chars</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ParaphrasePanel
        sectionId={sectionId}
        content={content}
        sectionKey={sectionKey}
        onSaveSuccess={loadData}
      />

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
