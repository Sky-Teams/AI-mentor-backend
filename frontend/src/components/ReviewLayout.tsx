import type { ReviewRun } from "../types/api";

interface ReviewLayoutProps {
  review: ReviewRun | null;
}

export const ReviewLayout = ({ review }: ReviewLayoutProps) => {
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
    <div className="review-layout">
      {review.warnings?.length ? (
        <>
          <div className="review-grid">
            <h4>Warnings</h4>
            <ul className="simple-list">
              {review.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {review.nextSteps?.length ? (
        <>
          <div className="review-grid">
            <h4>Next Steps</h4>
            <ul className="simple-list">
              {review.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {review.missingInfoQuestions?.length ? (
        <>
          <div className="review-grid">
            <h4>Missing Information Questions</h4>
            <ul className="simple-list">
              {review.missingInfoQuestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
};
