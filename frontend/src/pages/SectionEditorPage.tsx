import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReviewPanel } from "../components/ReviewPanel";
import { projectsApi } from "../services/api/projects";
import { reviewsApi } from "../services/api/reviews";
import type { ParaphraseRun, ProjectSection, ReviewRun } from "../types/api";
import { ReviewLayout } from "../components/ReviewLayout";
import { ParaphrasePanel } from "../components/ParaphrasePanel";
import { paraphraseApi } from "../services/api/paraphrase";

export const SectionEditorPage = () => {
  const { projectId = "", sectionKey = "" } = useParams();
  const [section, setSection] = useState<ProjectSection | null>(null);
  const [reviews, setReviews] = useState<ReviewRun[]>([]);
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [paraphraseRuns, setParaphraseRuns] = useState<ParaphraseRun[]>([]);
  const [sectionId, setSectionId] = useState<string>(String);

  const load = async () => {
    const [sectionData, reviewData] = await Promise.all([
      projectsApi.getSection(projectId, sectionKey),
      reviewsApi.listProjectReviews(projectId),
    ]);
    setSection(sectionData);
    setSectionId(sectionData.id);
    if (sectionData.id) {
      const paraphraseData = await paraphraseApi.getSectionParaphrase(
        projectId,
        sectionData.id,
      );
      const flatList = Array.isArray(paraphraseData)
        ? paraphraseData.flat()
        : [];
      setParaphraseRuns(flatList);
    }
    setContent(sectionData.content);
    setReviews(reviewData);
  };

  useEffect(() => {
    void load();
  }, [projectId, sectionKey]);

  const latestSectionReview = useMemo(
    () => reviews.find((review) => review.sectionKey === sectionKey) ?? null,
    [reviews, sectionKey],
  );

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
    await projectsApi.updateSection(projectId, sectionKey, {
      content,
      changeSummary: "Updated from internal web UI",
    });
    setStatusMessage("Section saved and versioned.");
    setIsSaving(false);
    await load();
  };

  const handleReview = async () => {
    setIsReviewing(true);
    setStatusMessage(null);
    await projectsApi.updateSection(projectId, sectionKey, {
      content,
      changeSummary: "Saved before AI review",
    });
    await reviewsApi.triggerReview(projectId, sectionKey);
    setStatusMessage("Review triggered. Refreshing review state...");
    setIsReviewing(false);
    await load();
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
            </div>
            <textarea
              className="editor-area"
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              value={content}
            />
            <span className="badge">{content.length} characters</span>
          </div>

          <ReviewPanel review={latestSectionReview} />
        </div>
        <ReviewLayout review={latestSectionReview} />
      </div>

      {latestSectionParaphrase && (
        <ParaphrasePanel
          sectionId={sectionId}
          paraphrase={latestSectionParaphrase[0]}
        />
      )}
    </div>
  );
};
