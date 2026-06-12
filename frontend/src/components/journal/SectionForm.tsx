import type {
  ChecklistDraft,
  SectionDraft,
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
}: SectionFormProps) => (
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
      <span>Section Description</span>
      <textarea
        onChange={(event) =>
          onUpdate({ ...section, description: event.target.value })
        }
        placeholder="What this section is for."
        rows={2}
        value={section.description}
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

    <button className="secondary-button" onClick={onAddChecklist} type="button">
      + Add Checklist
    </button>
  </div>
);
