import type { ReviewIssue } from "../types/api";

interface IssuesListProps {
  issues: ReviewIssue[];
  onToggleResolved: (issue: ReviewIssue) => Promise<void>;
}

export const IssuesList = ({ issues, onToggleResolved }: IssuesListProps) => (
  <div className="card">
    <div className="card-header">
      <h3>Issues</h3>
      <span className="badge">{issues.length}</span>
    </div>

    {issues.length === 0 ? (
      <p className="muted-text">No review issues found yet.</p>
    ) : (
      <div className="stack">
        {issues.map((issue) => (
          <div className="issue-item" key={issue.id}>
            <div className="issue-header">
              <div>
                <strong>{issue.title}</strong>
                <p className="muted-text">
                  {issue.category} · {issue.severity}
                </p>
              </div>
              <button
                className="secondary-button"
                onClick={() => void onToggleResolved(issue)}
                type="button"
              >
                {issue.status === "RESOLVED" ? "Mark Open" : "Resolve"}
              </button>
            </div>
            <p>{issue.description}</p>
            <p className="muted-text">Why it matters: {issue.reason}</p>
            <p className="muted-text">Fix suggestion: {issue.fixSuggestion}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);
