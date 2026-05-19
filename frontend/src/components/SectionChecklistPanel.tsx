// frontend/src/components/SectionChecklistPanel.tsx
import type { ProjectSection } from "../types/api";

type Props = {
  section: ProjectSection | null;
};

export function SectionChecklistPanel({ section }: Props) {
  const checklist = section?.checklist ?? [];

  return (
    <div className="card checklist-panel">
      <div className="card-header">
        <h3 className="checklist-panel__title">Checklist</h3>
      </div>

      {checklist.length === 0 ? (
        <p className="muted-text">No checklist for this section.</p>
      ) : (
        <div className="checklist-panel__groups">
          {checklist.map((group, idx) => (
            <div key={`${group.title ?? "group"}-${idx}`}>
              {group.title ? (
                <h4 className="checklist-panel__group-title">{group.title}</h4>
              ) : null}
              <ul className="checklist-panel__list">
                {group.items.map((item, i) => (
                  <li key={`${idx}-${i}`} className="checklist-panel__item">
                    <input
                      aria-label="Checklist item"
                      type="checkbox"
                      disabled
                      className="checklist-panel__checkbox"
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
