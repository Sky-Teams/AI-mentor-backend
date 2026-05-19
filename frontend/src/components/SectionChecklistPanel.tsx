// frontend/src/components/SectionChecklistPanel.tsx
import type { ProjectSection } from "../types/api";

type Props = {
  section: ProjectSection | null;
  compact?: boolean;
  maxHeight?: number;
  hideHeader?: boolean;
};

export function SectionChecklistPanel({
  section,
  compact,
  maxHeight,
  hideHeader,
}: Props) {
  const checklist = section?.checklist ?? [];

  return (
    <div
      className="card"
      style={{
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        overflow: maxHeight ? "auto" : undefined,
        padding: compact ? "0.85rem" : undefined,
      }}
    >
      {!hideHeader ? (
        <div className="card-header">
          <h3 style={{ fontSize: compact ? 13 : undefined }}>Checklist</h3>
        </div>
      ) : null}

      {checklist.length === 0 ? (
        <p className="muted-text">No checklist for this section.</p>
      ) : (
        <div style={{ display: "grid", gap: compact ? 10 : 12 }}>
          {checklist.map((group, idx) => (
            <div key={`${group.title ?? "group"}-${idx}`}>
              {group.title ? (
                <h4
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: compact ? 13 : undefined,
                  }}
                >
                  {group.title}
                </h4>
              ) : null}
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {group.items.map((item, i) => (
                  <li
                    key={`${idx}-${i}`}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      fontSize: compact ? 12.5 : undefined,
                      lineHeight: compact ? 1.35 : undefined,
                      margin: compact ? "4px 0" : "6px 0",
                    }}
                  >
                    <input
                      aria-label="Checklist item"
                      type="checkbox"
                      disabled
                      style={{
                        width: 14,
                        height: 14,
                        marginTop: 2,
                      }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
