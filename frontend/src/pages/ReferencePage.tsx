import { useState } from "react";
import { ReferenceSearchPanel } from "../components/referenceSearchPanel";
import {
  Reference,
  ReferenceStyle,
  ReferenceTypes,
} from "../services/api/reference";
import { referenceFormatterService } from "../services/formatters/referenceFormatterService";

export const ReferencePage = () => {
  const [isOpenSeacrhBox, setIsOpenSearchBox] = useState(false);
  const [savedReference, setSavedReference] = useState<
    { id: string; text: string; raw: any; type: string }[]
  >([]);
  const [currentStyle, setCurrentStyle] = useState<ReferenceStyle>("APA");
  const [errorMessage, setErrorMessage] = useState("");
  const formatStyle = ["APA", "MLA", "VANCOUVER"];

  const handleSaveReference = async (
    selectedReference: Reference,
    searchType: ReferenceTypes,
  ) => {
    try {
      const formattedText = await referenceFormatterService.format(
        selectedReference,
        searchType,
        currentStyle,
      );
      const newReference = {
        id: selectedReference.id || Date.now().toString(),
        text: formattedText,
        raw: selectedReference,
        type: searchType,
      };

      setSavedReference((prevReference) => [...prevReference, newReference]);
      setIsOpenSearchBox(false);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error?.message);
      console.log(error);
    }
  };

  const handleStyleChange = async (newStyle: ReferenceStyle) => {
    try {
      setCurrentStyle(newStyle);

      const updatedReferenceStyle = await Promise.all(
        savedReference.map(async (item) => {
          const newFormattedText = await referenceFormatterService.format(
            item.raw,
            item.type as ReferenceTypes,
            newStyle,
          );
          return { ...item, text: newFormattedText };
        }),
      );
      setSavedReference(updatedReferenceStyle);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error?.message);
      console.log(error);
    }
  };
  return (
    <div>
      <div className="page-header">
        <div className="button-row">
          <button
            className="primary-button"
            onClick={() => setIsOpenSearchBox(true)}
          >
            New Citation
          </button>
          <select
            className="modern-select"
            name=""
            id=""
            value={currentStyle}
            onChange={(e) =>
              handleStyleChange(e.target.value as ReferenceStyle)
            }
          >
            {formatStyle.map((item, index) => (
              <option value={item} key={index}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ReferenceSearchPanel
        isOpen={isOpenSeacrhBox}
        onClose={() => setIsOpenSearchBox(false)}
        onSaveReference={handleSaveReference}
      />

      <div className="card">
        <h3>References</h3>
        {savedReference && savedReference.length > 0 ? (
          <ul className="saved-references-list">
            {savedReference.map((item, index) => {
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
