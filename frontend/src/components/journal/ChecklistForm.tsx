import type { ChecklistDraft } from "../../utils/journalForm";
import { ItemForm } from "./ItemForm";

type ChecklistFormProps = {
  checklist: ChecklistDraft;
  checklistIndex: number;
  checklistCount: number;
  onAddItem: () => void;
  onRemove: () => void;
  onUpdate: (checklist: ChecklistDraft) => void;
};

export const ChecklistForm = ({
  checklist,
  checklistIndex,
  checklistCount,
  onAddItem,
  onRemove,
  onUpdate,
}: ChecklistFormProps) => {
  const updateItemText = (itemId: string, text: string) => {
    onUpdate({
      ...checklist,
      items: checklist.items.map((item) =>
        item.id === itemId ? { ...item, text } : item,
      ),
    });
  };

  return (
    <div className="journal-checklist">
      <div className="card-header">
        <h5>Checklist {checklistIndex + 1}</h5>
        <button
          className="journal-text-button"
          disabled={checklistCount === 1}
          onClick={onRemove}
          type="button"
        >
          Remove Checklist
        </button>
      </div>

      <label className="field">
        <span>Checklist Title</span>
        <input
          onChange={(event) =>
            onUpdate({ ...checklist, title: event.target.value })
          }
          placeholder="Mindset Checklist"
          value={checklist.title}
        />
      </label>

      <div className="journal-item-list">
        {checklist.items.map((item, itemIndex) => (
          <ItemForm
            item={item}
            itemCount={checklist.items.length}
            itemIndex={itemIndex}
            key={item.id}
            onRemove={() =>
              onUpdate({
                ...checklist,
                items: checklist.items.filter(
                  (currentItem) => currentItem.id !== item.id,
                ),
              })
            }
            onUpdateText={(text) => updateItemText(item.id, text)}
          />
        ))}
      </div>

      <button className="secondary-button" onClick={onAddItem} type="button">
        + Add Item
      </button>
    </div>
  );
};
