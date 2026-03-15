import type { ReadinessSnapshot } from "../types/api";

interface ReadinessCardProps {
  readiness: ReadinessSnapshot | null;
}

export const ReadinessCard = ({ readiness }: ReadinessCardProps) => {
  if (!readiness) {
    return (
      <div className="card">
        <h3>Readiness</h3>
        <p className="muted-text">No readiness snapshot available yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Readiness</h3>
        <span className="badge">{readiness.status}</span>
      </div>
      <p>{readiness.summary}</p>
      <div className="metric-grid">
        <div className="metric-box">
          <span>Overall Score</span>
          <strong>{readiness.overallScore}</strong>
        </div>
        <div className="metric-box">
          <span>Blockers</span>
          <strong>{readiness.blockers.length}</strong>
        </div>
        <div className="metric-box">
          <span>Strengths</span>
          <strong>{readiness.strengths.length}</strong>
        </div>
      </div>
    </div>
  );
};
