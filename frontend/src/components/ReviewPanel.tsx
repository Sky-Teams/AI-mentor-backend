import type { ReviewRun } from "../types/api";

interface ReviewPanelProps {
  review: ReviewRun | null;
}

export const ReviewPanel = ({ review }: ReviewPanelProps) => {
  if (!review) {
    return (
      <div className="card">
        <h3>Latest Review</h3>
        <p className="muted-text">
          No review has been run for this section yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card latest-review">
      <div className="card-header">
        <h3>Latest Review</h3>
        <span className="badge">{review.status}</span>
      </div>
      <hr />
      <p>{review.summary ?? "No summary returned."}</p>
      <div className="metric-grid">
        <div className="metric-box">
          <span>Overall Score</span>
          <strong>{review.overallScore ?? "-"}</strong>
        </div>
        <div className="metric-box">
          <span>Readiness</span>
          <strong>{review.readinessIndicator ?? "-"}</strong>
        </div>
        <div className="metric-box">
          <span>Technical Tokens</span>
          <strong>{review.totalTokens ?? 0}</strong>
        </div>
        <div className="metric-box">
          <span>App Credits</span>
          <strong>{review.appCreditsConsumed}</strong>
        </div>
      </div>
    </div>
  );
};
