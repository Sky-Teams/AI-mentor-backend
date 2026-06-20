import { useState } from "react";
import { ReferenceSearchPanel } from "../components/referenceSearchPanel";
import {
  CreateReferenceInput,
  Reference,
  referenceApi,
  ReferenceStyle,
  ReferenceStyles,
  ReferenceTypes,
} from "../services/api/reference";

export const ReferencePage = () => {
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false);
  const [saveReferences, setSaveReferences] = useState<
    { id: string; text: string; raw: Reference; type: ReferenceTypes }[]
  >([]);
  const [currentStyle, setCurrentStyle] = useState<ReferenceStyle>("APA");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddReference = async (references: CreateReferenceInput) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const [formattedText] = await referenceApi.formatReference({
        references: [
          {
            reference: references.reference,
            type: references.type,
          },
        ],
        style: currentStyle,
      });

      const newReference = {
        id: references.reference.id,
        text: formattedText,
        raw: references.reference,
        type: references.type,
      };

      setSaveReferences((prev) => [...prev, newReference]);
      setIsSearchBoxOpen(false);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error?.message || "Failed to add reference",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleChange = async (newStyle: ReferenceStyle) => {
    try {
      setCurrentStyle(newStyle);
      setIsLoading(true);
      setErrorMessage("");
      const formattedTexts = await referenceApi.formatReference({
        references: saveReferences.map((item) => ({
          reference: item.raw,
          type: item.type,
        })),
        style: newStyle,
      });

      const updateFormatStyles = saveReferences.map((item, index) => {
        return {
          ...item,
          text: formattedTexts[index],
        };
      });
      setSaveReferences(updateFormatStyles);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error?.message || "Failed to format reference",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="page-header">
        <div className="button-row">
          <button
            className="primary-button"
            onClick={() => setIsSearchBoxOpen(true)}
          >
            New Citation
          </button>
          <select
            className="modern-select"
            value={currentStyle}
            onChange={(e) =>
              handleStyleChange(e.target.value as ReferenceStyle)
            }
          >
            {ReferenceStyles.map((item, index) => (
              <option value={item} key={index} disabled={isLoading}>
                {isLoading ? "Loading..." : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ReferenceSearchPanel
        isOpen={isSearchBoxOpen}
        onClose={() => setIsSearchBoxOpen(false)}
        onSaveReference={(reference) => handleAddReference(reference)}
      />

      <div className="card">
        <h3>References</h3>
        {saveReferences.length > 0 ? (
          <ul className="saved-references-list">
            {saveReferences.map((item, index) => {
              return <li key={item.id || index}>{item.text}</li>;
            })}
          </ul>
        ) : (
          <p style={{ color: "#888" }}>No reference yet.</p>
        )}
      </div>
    </div>
  );
};
