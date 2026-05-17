import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ReviewPanel } from "../components/ReviewPanel";
import { projectsApi } from "../services/api/projects";
import { reviewsApi } from "../services/api/reviews";
import type { ParaphraseRun, ProjectSection, ReviewRun } from "../types/api";
import { ReviewLayout } from "../components/ReviewLayout";
import { ParaphrasePanel } from "../components/ParaphrasePanel";
import { paraphraseApi } from "../services/api/paraphrase";

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
  const [paraphraseRuns, setParaphraseRuns] = useState<ParaphraseRun[]>([]);
  const [sectionId, setSectionId] = useState("");

  // Load all data (merged from both versions)
  const loadData = async () => {
    // Get project (for all sections), current section, and reviews
    const project = await projectsApi.get(projectId);
    const currentSection = await projectsApi.getSection(projectId, sectionKey);
    const allReviews = await reviewsApi.listProjectReviews(projectId);

    setSection(currentSection);
    setSectionId(currentSection.id);
    setContent(currentSection.content);
    setAllSections(project.sections || []);
    setReviews(allReviews);

    // Load paraphrase data if section has ID
    if (currentSection.id) {
      const paraphraseData = await paraphraseApi.getSectionParaphrase(
        projectId,
        currentSection.id,
      );
      const flatList = Array.isArray(paraphraseData)
        ? paraphraseData.flat()
        : [];
      setParaphraseRuns(flatList);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, sectionKey]);

  // Find the current section's position
  const currentIndex = allSections.findIndex((s) => s.key === sectionKey);
  const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < allSections.length - 1
      ? allSections[currentIndex + 1]
      : null;
  const isLast = currentIndex === allSections.length - 1;

  // Check if user made changes
  const hasUnsavedChanges = section && section.content !== content;

  const latestSectionParaphrase = useMemo(
    () =>
      paraphraseRuns
        .filter((p) => p.sectionId === section?.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [paraphraseRuns, section?.id],
  );

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
    // If there are unsaved changes, ask user what to do
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
    // Go to the new section
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
          <div className="card">
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

          <ReviewPanel review={latestSectionReview} />
        </div>
        <ReviewLayout review={latestSectionReview} />
      </div>

      {/* Simple navigation buttons */}
      <div
        className="button-row"
        style={{ justifyContent: "space-between", marginTop: "1rem" }}
      >
        <button
          className="secondary-button"
          onClick={() => prevSection && goToSection(prevSection.key)}
          disabled={!prevSection}
        >
          ← Previous
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
        >
          {isLast ? "Finish →" : "Next →"}
        </button>
      </div>

      {latestSectionParaphrase && latestSectionParaphrase[0] && (
        <ParaphrasePanel
          sectionId={sectionId}
          paraphrase={latestSectionParaphrase[0]}
          content={content}
          sectionKey={sectionKey}
        />
      )}

      <p className="muted-text">
        Reminder: AI feedback is helpful, but please have a human review it
        before you act on it.
      </p>
    </div>
  );
};
