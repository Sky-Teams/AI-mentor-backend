import type { ReviewRun } from "../types/api";

interface ReviewPanelProps {
  review: ReviewRun | null;
}

export const ReviewPanel = ({ review }: ReviewPanelProps) => {
  if (!review) {
    return (
      <div className="card">
        <h3>Latest Review</h3>
        <p className="muted-text">No review has been run for this section yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Latest Review</h3>
        <span className="badge">{review.status}</span>
      </div>
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

      {review.warnings?.length ? (
        <>
          <h4>Warnings</h4>
          <ul className="simple-list">
            {review.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </>
      ) : null}

      {review.nextSteps?.length ? (
        <>
          <h4>Next Steps</h4>
          <ul className="simple-list">
            {review.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </>
      ) : null}

      {review.missingInfoQuestions?.length ? (
        <>
          <h4>Missing Information Questions</h4>
          <ul className="simple-list">
            {review.missingInfoQuestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
};
