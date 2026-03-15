import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IssuesList } from "../components/IssuesList";
import { ReadinessCard } from "../components/ReadinessCard";
import { projectsApi } from "../services/api/projects";
import { reviewsApi } from "../services/api/reviews";
import type { Project, ReadinessSnapshot, ReviewIssue, ReviewRun } from "../types/api";

export const ProjectDetailsPage = () => {
  const { projectId = "" } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [reviews, setReviews] = useState<ReviewRun[]>([]);
  const [issues, setIssues] = useState<ReviewIssue[]>([]);
  const [readiness, setReadiness] = useState<ReadinessSnapshot | null>(null);

  const load = async () => {
    const [projectData, reviewsData, issuesData, readinessData] = await Promise.all([
      projectsApi.get(projectId),
      reviewsApi.listProjectReviews(projectId),
      reviewsApi.listIssues(projectId),
      reviewsApi.getReadiness(projectId),
    ]);

    setProject(projectData);
    setReviews(reviewsData);
    setIssues(issuesData);
    setReadiness(readinessData);
  };

  useEffect(() => {
    void load();
  }, [projectId]);

  const handleToggleIssue = async (issue: ReviewIssue) => {
    const nextStatus = issue.status === "RESOLVED" ? "OPEN" : "RESOLVED";
    await reviewsApi.updateIssue(issue.id, nextStatus);
    await load();
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Project</p>
          <h1>{project?.title ?? "Loading project..."}</h1>
          <p className="muted-text">
            Status: {project?.status ?? "-"} · Target journal: {project?.targetJournal ?? "Not set"}
          </p>
        </div>
      </div>

      <ReadinessCard readiness={readiness} />

      <div className="two-column-grid">
        <div className="card">
          <div className="card-header">
            <h3>Sections</h3>
            <span className="badge">{project?.sections?.length ?? 0}</span>
          </div>
          <div className="stack">
            {(project?.sections ?? []).map((section) => (
              <Link
                className="section-link"
                key={section.id}
                to={`/projects/${projectId}/sections/${section.key}`}
              >
                <div>
                  <strong>{section.title}</strong>
                  <p className="muted-text">
                    {section.status} {section.isOptional ? "· Optional" : ""}
                  </p>
                </div>
                <span>{section.content.trim().length} chars</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Review History</h3>
            <span className="badge">{reviews.length}</span>
          </div>
          <div className="stack">
            {reviews.length === 0 ? (
              <p className="muted-text">No review runs yet.</p>
            ) : (
              reviews.map((review) => (
                <div className="issue-item" key={review.id}>
                  <strong>{review.sectionKey ?? "Section review"}</strong>
                  <p className="muted-text">
                    {review.status} · Score {review.overallScore ?? "-"} · Tokens{" "}
                    {review.totalTokens ?? 0}
                  </p>
                  <p>{review.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <IssuesList issues={issues} onToggleResolved={handleToggleIssue} />
    </div>
  );
};
