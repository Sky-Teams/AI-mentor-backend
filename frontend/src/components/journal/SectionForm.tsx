import {
  createChecklist,
  createItem,
  createSection,
  type ChecklistDraft,
  type SectionDraft,
} from "../../utils/journalForm";
import { ChecklistForm } from "./ChecklistForm";

type SectionFormProps = {
  section: SectionDraft;
  sectionIndex: number;
  sectionCount: number;
  onAddChecklist: () => void;
  onAddItem: (checklist: ChecklistDraft) => void;
  onRemove: () => void;
  onRemoveChecklist: (checklistId: string) => void;
  onUpdate: (section: SectionDraft) => void;
  onUpdateChecklist: (
    checklistId: string,
    nextChecklist: ChecklistDraft,
  ) => void;
};

export const SectionForm = ({
  section,
  sectionIndex,
  sectionCount,
  onAddChecklist,
  onAddItem,
  onRemove,
  onRemoveChecklist,
  onUpdate,
  onUpdateChecklist,
}: SectionFormProps) => {
  const addSubsection = () => {
    onUpdate({
      ...section,
      subsections: [...section.subsections, createSection()],
    });
  };

  const removeSubsection = (subId: string) => {
    onUpdate({
      ...section,
      subsections: section.subsections.filter((s) => s.id !== subId),
    });
  };

  const updateSubsection = (subId: string, next: SectionDraft) => {
    onUpdate({
      ...section,
      subsections: section.subsections.map((s) => (s.id === subId ? next : s)),
    });
  };

  const addSubChecklist = (subId: string) => {
    const sub = section.subsections.find((s) => s.id === subId);
    if (!sub) return;
    updateSubsection(subId, {
      ...sub,
      checklists: [...sub.checklists, createChecklist()],
    });
  };

  const removeSubChecklist = (subId: string, checklistId: string) => {
    const sub = section.subsections.find((s) => s.id === subId);
    if (!sub) return;
    updateSubsection(subId, {
      ...sub,
      checklists: sub.checklists.filter((c) => c.id !== checklistId),
    });
  };

  const updateSubChecklist = (
    subId: string,
    checklistId: string,
    next: ChecklistDraft,
  ) => {
    const sub = section.subsections.find((s) => s.id === subId);
    if (!sub) return;
    updateSubsection(subId, {
      ...sub,
      checklists: sub.checklists.map((c) => (c.id === checklistId ? next : c)),
    });
  };

  const addSubChecklistItem = (subId: string, checklist: ChecklistDraft) => {
    updateSubChecklist(subId, checklist.id, {
      ...checklist,
      items: [...checklist.items, createItem()],
    });
  };

  return (
    <div className="journal-section">
      <div className="journal-section-card">
        <div className="card-header">
          <h4>Section {sectionIndex + 1}</h4>
          <button
            className="journal-text-button"
            disabled={sectionCount === 1}
            onClick={onRemove}
            type="button"
          >
            Remove Section
          </button>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Section Title</span>
            <input
              onChange={(event) =>
                onUpdate({ ...section, title: event.target.value })
              }
              placeholder="Morning Reflection"
              required
              value={section.title}
            />
          </label>

          <label className="journal-check-field">
            <input
              checked={section.isOptional}
              onChange={(event) =>
                onUpdate({ ...section, isOptional: event.target.checked })
              }
              type="checkbox"
            />
            Optional section
          </label>

          <label className="field">
            <span>Max Characters</span>
            <input
              min={1}
              onChange={(event) =>
                onUpdate({ ...section, maxChars: event.target.value })
              }
              placeholder="1000"
              required
              type="number"
              value={section.maxChars}
            />
          </label>
        </div>

        <label className="field">
          <span>Section AI Review Prompt</span>
          <textarea
            onChange={(event) =>
              onUpdate({ ...section, sectionPrompt: event.target.value })
            }
            placeholder="Guidelines for AI when reviewing this section"
            rows={2}
            value={section.sectionPrompt}
          />
        </label>

        <div className="journal-checklist-list">
          {section.checklists.map((checklist, checklistIndex) => (
            <ChecklistForm
              checklist={checklist}
              checklistCount={section.checklists.length}
              checklistIndex={checklistIndex}
              key={checklist.id}
              onAddItem={() => onAddItem(checklist)}
              onRemove={() => onRemoveChecklist(checklist.id)}
              onUpdate={(nextChecklist) =>
                onUpdateChecklist(checklist.id, nextChecklist)
              }
            />
          ))}
        </div>

        <button
          className="secondary-button"
          onClick={onAddChecklist}
          type="button"
        >
          + Add Checklist
        </button>

        {/* subsections */}
        {section.subsections.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
              paddingLeft: "1rem",
              borderLeft: "3px solid #e5e7eb",
            }}
          >
            <h5 style={{ marginBottom: "0.5rem" }}>Subsections</h5>
            {section.subsections.map((sub, subIndex) => (
              <div
                key={sub.id}
                className="journal-section-card"
                style={{ marginBottom: "0.5rem" }}
              >
                <div className="card-header">
                  <h4>Subsection {subIndex + 1}</h4>
                  <button
                    className="journal-text-button"
                    onClick={() => removeSubsection(sub.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <span>Title</span>
                    <input
                      onChange={(e) =>
                        updateSubsection(sub.id, {
                          ...sub,
                          title: e.target.value,
                        })
                      }
                      placeholder="Subsection title"
                      required
                      value={sub.title}
                    />
                  </label>

                  <label className="journal-check-field">
                    <input
                      checked={sub.isOptional}
                      onChange={(e) =>
                        updateSubsection(sub.id, {
                          ...sub,
                          isOptional: e.target.checked,
                        })
                      }
                      type="checkbox"
                    />
                    Optional
                  </label>

                  <label className="field">
                    <span>Max Characters</span>
                    <input
                      min={1}
                      onChange={(e) =>
                        updateSubsection(sub.id, {
                          ...sub,
                          maxChars: e.target.value,
                        })
                      }
                      placeholder="500"
                      type="number"
                      value={sub.maxChars}
                      required
                    />
                  </label>
                </div>

                <label className="field">
                  <span>SectionPrompt</span>
                  <textarea
                    onChange={(e) =>
                      updateSubsection(sub.id, {
                        ...sub,
                        sectionPrompt: e.target.value,
                      })
                    }
                    placeholder="What this subsection is for."
                    rows={2}
                    value={sub.sectionPrompt}
                  />
                </label>

                <div className="journal-checklist-list">
                  {sub.checklists.map((checklist, checklistIndex) => (
                    <ChecklistForm
                      checklist={checklist}
                      checklistCount={sub.checklists.length}
                      checklistIndex={checklistIndex}
                      key={checklist.id}
                      onAddItem={() => addSubChecklistItem(sub.id, checklist)}
                      onRemove={() => removeSubChecklist(sub.id, checklist.id)}
                      onUpdate={(next) =>
                        updateSubChecklist(sub.id, checklist.id, next)
                      }
                    />
                  ))}
                </div>

                <button
                  className="secondary-button"
                  onClick={() => addSubChecklist(sub.id)}
                  type="button"
                  style={{ marginTop: "0.5rem" }}
                >
                  + Add Checklist
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="secondary-button"
          onClick={addSubsection}
          type="button"
          style={{ marginTop: "0.5rem" }}
        >
          + Add Subsection
        </button>
      </div>
    </div>
  );
};
