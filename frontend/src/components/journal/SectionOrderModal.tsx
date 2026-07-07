// src/components/journal/SectionOrderModal.tsx
import { useEffect, useState } from "react";
import type { SectionDraft } from "../../utils/journalForm";

type Props = {
  isOpen: boolean;
  isSaving: boolean;
  sections: SectionDraft[];
  onClose: () => void;
  onSave: (nextSections: SectionDraft[]) => Promise<void> | void;
};

type DragState =
  | { type: "section"; sectionIndex: number }
  | { type: "subsection"; sectionIndex: number; subsectionIndex: number }
  | null;

export const SectionOrderModal = ({
  isOpen,
  isSaving,
  sections,
  onClose,
  onSave,
}: Props) => {
  const [draftSections, setDraftSections] = useState<SectionDraft[]>([]);
  const [dragState, setDragState] = useState<DragState>(null);

  useEffect(() => {
    if (!isOpen) return;

    setDraftSections(
      sections.map((section) => ({
        ...section,
        subsections: [...section.subsections],
      })),
    );
  }, [isOpen, sections]);

  if (!isOpen) return null;

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const next = [...draftSections];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDraftSections(next);
  };

  const moveSubsection = (
    sectionIndex: number,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return;

    const next = [...draftSections];
    const subsections = [...next[sectionIndex].subsections];
    const [moved] = subsections.splice(fromIndex, 1);
    subsections.splice(toIndex, 0, moved);

    next[sectionIndex] = {
      ...next[sectionIndex],
      subsections,
    };

    setDraftSections(next);
  };

  const handleDropSection = (targetIndex: number) => {
    if (!dragState || dragState.type !== "section") return;
    moveSection(dragState.sectionIndex, targetIndex);
    setDragState(null);
  };

  const handleDropSubsection = (sectionIndex: number, targetIndex: number) => {
    if (
      !dragState ||
      dragState.type !== "subsection" ||
      dragState.sectionIndex !== sectionIndex
    ) {
      return;
    }

    moveSubsection(sectionIndex, dragState.subsectionIndex, targetIndex);
    setDragState(null);
  };

  const handleSave = async () => {
    await onSave(draftSections);
  };

  return (
    <div className="modal-reference" onClick={onClose}>
      <div
        className="modal-content journal-order-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="header-reference">
          <h3>Reorder sections</h3>
          <p className="muted-text">
            Drag sections or subsections to change their order.
          </p>
        </div>

        <div className="journal-order-list">
          {draftSections.map((section, sectionIndex) => (
            <div
              key={section.id}
              className={`journal-order-card ${
                dragState?.type === "section" &&
                dragState.sectionIndex === sectionIndex
                  ? "dragging"
                  : ""
              }`}
              onDragEnd={() => setDragState(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDropSection(sectionIndex)}
            >
              <div
                className="journal-order-section-header"
                draggable
                onDragStart={() =>
                  setDragState({ type: "section", sectionIndex })
                }
              >
                <div className="journal-order-section-title">
                  <span className="journal-order-section-badge">
                    {sectionIndex + 1}
                  </span>
                  <div>
                    <strong>
                      {section.title.trim() || `Section ${sectionIndex + 1}`}
                    </strong>
                    <p className="journal-order-section-meta">
                      {section.subsections.length > 0
                        ? `${section.subsections.length} subsections`
                        : null}
                    </p>
                  </div>
                </div>
                <span className="journal-order-drag-pill">Drag to reorder</span>
              </div>

              <div className="journal-order-sublist">
                {section.subsections.length > 0
                  ? section.subsections.map((subsection, subsectionIndex) => (
                      <div
                        key={subsection.id}
                        className={`journal-order-subitem ${
                          dragState?.type === "subsection" &&
                          dragState.sectionIndex === sectionIndex &&
                          dragState.subsectionIndex === subsectionIndex
                            ? "dragging"
                            : ""
                        }`}
                        draggable
                        onDragEnd={() => setDragState(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDragStart={() =>
                          setDragState({
                            type: "subsection",
                            sectionIndex,
                            subsectionIndex,
                          })
                        }
                        onDrop={() =>
                          handleDropSubsection(sectionIndex, subsectionIndex)
                        }
                      >
                        <span className="drag-handle">↳</span>
                        <span>
                          {subsection.title.trim() ||
                            `Subsection ${subsectionIndex + 1}`}
                        </span>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          ))}
        </div>

        <div className="journal-order-actions">
          <button
            className="secondary-button"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>

          <button
            className="primary-button"
            disabled={isSaving}
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "Saving..." : "Save order"}
          </button>
        </div>
      </div>
    </div>
  );
};
