import { useState } from "react";
import { ReferenceSearchPanel } from "./referenceSearchPanel";
import {
  referenceApi,
  ReferenceStyle,
  referenceStyles,
} from "../services/api/reference";
import type {
  CreateReferenceInput,
  Reference,
} from "../services/api/reference";

type Props = {
  references: Array<{ reference: Reference; formattedText: string }>;
  onClose: () => void;
  onAddReference: (reference: CreateReferenceInput) => Promise<void>;
  onInsert: (citation: string, reference: Reference) => void;
};

export const InlineCitationModal = ({
  references,
  onClose,
  onAddReference,
  onInsert,
}: Props) => {
  const [style, setStyle] = useState<ReferenceStyle>("APA");
  const [selected, setSelected] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addReference = async (reference: CreateReferenceInput) => {
    setLoading(true);
    try {
      await onAddReference(reference);
      setSearchOpen(false);
    } catch (error: any) {
      setError(
        error?.response?.data?.error?.message || "Could not add reference.",
      );
    } finally {
      setLoading(false);
    }
  };

  const insert = async () => {
    if (selected === null) return;

    setLoading(true);
    try {
      const item = references[selected];

      const citation = await referenceApi.formatInlineCitation({
        reference: item.reference,
        style,
      });

      onInsert(citation, item.reference);
      onClose();
    } catch (error: any) {
      setError(
        error?.response?.data?.error?.message || "Could not format citation.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (searchOpen) {
    return (
      <ReferenceSearchPanel
        isOpen
        onClose={() => setSearchOpen(false)}
        onSaveReference={addReference}
      />
    );
  }

  return (
    <div className="modal-reference" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close" onClick={onClose} type="button">
          X
        </button>

        <h3>Add citation</h3>

        <label>
          Citation type
          <select
            className="modern-select"
            value={style}
            onChange={(event) => setStyle(event.target.value as ReferenceStyle)}
          >
            {referenceStyles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        <p>
          <strong>References</strong>
        </p>

        {references.map((item, index) => (
          <button
            className={
              selected === index ? "primary-button" : "secondary-button"
            }
            key={`${item.reference.id}-${index}`}
            onClick={() => setSelected(index)}
            type="button"
            style={{
              display: "block",
              width: "100%",
              marginBottom: "0.5rem",
              textAlign: "left",
            }}
          >
            {item.formattedText}
          </button>
        ))}

        {!references.length && (
          <p className="muted-text">No references in this project yet.</p>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() => setSearchOpen(true)}
            type="button"
          >
            Find new reference
          </button>

          <button
            className="primary-button"
            disabled={selected === null || loading}
            onClick={insert}
            type="button"
          >
            {loading ? "Adding..." : "Add citation"}
          </button>
        </div>
      </div>
    </div>
  );
};
