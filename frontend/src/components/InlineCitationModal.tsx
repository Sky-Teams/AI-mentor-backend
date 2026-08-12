import { useEffect, useState } from "react";
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

export type ReferenceItem =
  | (CreateReferenceInput & { formattedText?: string })
  | { referenceId: string; formattedText?: string; footnote?: string };

type Props = {
  references: ReferenceItem[];
  onClose: () => void;
  onAddReference: (reference: CreateReferenceInput) => Promise<void>;
  onInsert: (
    citation: { formattedText?: string; footnote?: string },
    reference: Reference,
  ) => void;
  onStyleChange: (style: ReferenceStyle) => void;
  style: ReferenceStyle;
};

const getReferenceId = (item: ReferenceItem): string =>
  "referenceId" in item ? item.referenceId : item.reference.id;

export const InlineCitationModal = ({
  references,
  onClose,
  onAddReference,
  onInsert,
  onStyleChange,
  style,
}: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayedReferences, setDisplayedReferences] = useState<string[]>(
    references.map((item) => item.formattedText ?? ""),
  );

  useEffect(() => {
    let active = true;

    const formatReferences = async () => {
      try {
        const items = references.filter(
          (item): item is Extract<ReferenceItem, { reference: Reference }> =>
            "reference" in item,
        );

        if (!items.length) {
          setDisplayedReferences(
            references.map((item) => item.formattedText ?? ""),
          );
          return;
        }

        const formatted = await referenceApi.formatReference({
          references: items.map((item) => ({
            reference: item.reference,
            type: "JOURNAL",
          })),
          style,
        });

        if (!active) return;

        let index = 0;
        setDisplayedReferences(
          references.map((item) =>
            "reference" in item
              ? formatted[index++]
              : (item.formattedText ?? ""),
          ),
        );
      } catch {
        if (active) {
          setDisplayedReferences(
            references.map((item) => item.formattedText ?? ""),
          );
        }
      }
    };

    formatReferences();
    return () => {
      active = false;
    };
  }, [references, style]);

  const addReference = async (reference: CreateReferenceInput) => {
    setLoading(true);
    try {
      await onAddReference(reference);
      setSearchOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const insert = async () => {
    if (selected === null) return;

    setLoading(true);
    try {
      const item = references[selected];
      if (!("reference" in item)) return;

      const citation = await referenceApi.formatInlineCitation({
        references: [
          { reference: item.reference, referenceIndex: selected + 1 },
        ],
        style,
      });

      onInsert(citation[0], item.reference);
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
        className="modal-content citation-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="citation-modal-header">
          <h3 className="citation-modal-title">Add citation</h3>
          <button
            className="close citation-modal-close"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <label className="citation-modal-label">
          <span className="citation-modal-label-text">Citation style</span>
          <select
            className="modern-select citation-modal-select"
            value={style}
            onChange={(event) =>
              onStyleChange(event.target.value as ReferenceStyle)
            }
          >
            {referenceStyles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        <div className="citation-modal-references-header">
          <strong>References</strong>
          <button
            className="secondary-button citation-modal-find-button"
            onClick={() => setSearchOpen(true)}
            type="button"
          >
            + Find new
          </button>
        </div>

        {references.length ? (
          <div className="citation-modal-references-list">
            {references.map((item, index) => (
              <label
                key={`${getReferenceId(item)}-${index}`}
                className={`citation-modal-reference-item ${
                  selected === index
                    ? "citation-modal-reference-item--selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="reference"
                  className="citation-modal-radio"
                  checked={selected === index}
                  onChange={() => setSelected(index)}
                />
                <li
                  style={{ listStyle: "none" }}
                  className="citation-modal-reference-text"
                  dangerouslySetInnerHTML={{
                    __html: displayedReferences[index] ?? item.formattedText,
                  }}
                />
                {}
              </label>
            ))}
          </div>
        ) : (
          <p className="muted-text citation-modal-empty">
            No references in this project yet. Click "Find new" to add one.
          </p>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="button-row citation-modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Cancel
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
