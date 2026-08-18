import type { SectionContent } from "../types/api";

type FigureItem = NonNullable<SectionContent["media"]>[number];

type Props = {
  figures: FigureItem[];
  onClose: () => void;
  onSelect: (figure: FigureItem) => void;
};

export const FigureModal = ({ figures, onClose, onSelect }: Props) => {
  return (
    <div className="fm-overlay" onClick={onClose}>
      <div className="fm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="fm-header">
          <div>
            <h3 className="fm-title">Add figure or table</h3>
            <span className="fm-subtitle">
              {figures.length} item{figures.length === 1 ? "" : "s"} available
            </span>
          </div>
          <button
            className="fm-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {figures.length ? (
          <div className="fm-grid">
            {figures.map((figure) => (
              <button
                key={figure.id}
                type="button"
                className="fm-card"
                onClick={() => onSelect(figure)}
              >
                <div className="fm-thumb">
                  <img src={figure.src} alt={figure.caption} />
                </div>
                <div className="fm-meta">
                  <span className="fm-label">{figure.label}</span>
                  <p className="fm-caption">{figure.caption}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="fm-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3 15l4.5-4 3.5 3 4-4.5L21 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>No figures or tables have been added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
