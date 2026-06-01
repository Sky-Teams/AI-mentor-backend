// frontend/src/components/SectionChecklistPanel.tsx
import { useState } from "react";
import type { ProjectSection } from "../types/api";
import { projectsApi } from "../services/api/projects";

type Props = {
  section: ProjectSection | null;
  projectId: string;
  sectionKey: string;
  onChanged?: () => void;
};

export function SectionChecklistPanel({
  section,
  projectId,
  sectionKey,
  onChanged,
}: Props) {
  const checklist = section?.checklist ?? [];
  const [savingKey, setSavingKey] = useState<string | null>(null);

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
                      className="checklist-panel__checkbox"
                      checked={Boolean(item.checked)}
                      disabled={savingKey === `${group.id}:${i}`}
                      onChange={async () => {
                        setSavingKey(`${group.id}:${i}`);
                        try {
                          await projectsApi.toggleSectionChecklistItem(
                            projectId,
                            sectionKey,
                            group.id,
                            i,
                          );
                          onChanged?.();
                        } finally {
                          setSavingKey(null);
                        }
                      }}
                    />
                    <span>{item.text}</span>
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
