import type { JournalItemDraft } from "../../utils/journalForm";

type ItemFormProps = {
  item: JournalItemDraft;
  itemIndex: number;
  itemCount: number;
  onRemove: () => void;
  onUpdateText: (text: string) => void;
};

export const ItemForm = ({
  item,
  itemIndex,
  itemCount,
  onRemove,
  onUpdateText,
}: ItemFormProps) => (
  <div className="journal-item-row">
    <label className="field">
      <span>Item {itemIndex + 1}</span>
      <input
        onChange={(event) => onUpdateText(event.target.value)}
        placeholder="What am I grateful for?"
        value={item.text}
      />
    </label>
    <button
      className="journal-icon-button"
      disabled={itemCount === 1}
      onClick={onRemove}
      title="Remove item"
      type="button"
    >
      x
    </button>
  </div>
);
