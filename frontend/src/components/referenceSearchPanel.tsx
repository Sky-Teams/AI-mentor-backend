import { useEffect, useState } from "react";
import {
  CreateReferenceInput,
  Reference,
  referenceApi,
  ReferenceTypes,
} from "../services/api/reference";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveReference: (references: CreateReferenceInput) => Promise<void>;
}

export const ReferenceSearchPanel = ({
  isOpen,
  onClose,
  onSaveReference,
}: Props) => {
  const [placeholderText, setPlaceholderText] = useState(
    "Search for journal article title or DOI",
  );
  const [searchType, setSearchType] = useState<ReferenceTypes>("JOURNAL");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      setSearchInput("");
      setReferences([]);
      setIsLoading(false);
      setSelectedReference(null);
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlaceholderText = (
    newPlaceholder: string,
    type: ReferenceTypes,
  ) => {
    setPlaceholderText(newPlaceholder);
    setSearchType(type);
  };

  const handleSaveReference = async (references: CreateReferenceInput) => {
    try {
      setIsLoading(true);
      await onSaveReference(references);
      setSelectedReference(null);
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error?.message ||
          "Error to handle save reference",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchReferences = async () => {
    const isIdentifier = searchInput.includes("/") || /\d/.test(searchInput);
    let searchParams = {};
    searchParams = isIdentifier ? { doi: searchInput } : { title: searchInput };
    try {
      setIsLoading(true);
      setErrorMessage("");

      const searchedReferences = await referenceApi.getReferences(
        searchParams,
        searchType,
      );

      if (Array.isArray(searchedReferences)) {
        if (searchedReferences.length === 0)
          return setErrorMessage("Result was not found");

        setReferences(searchedReferences);
      } else if (searchedReferences && typeof searchedReferences === "object") {
        setReferences([searchedReferences]);
      } else {
        setErrorMessage("Result was not found");
      }
    } catch (error: any) {
      setReferences([]);
      setErrorMessage(
        error?.response?.data?.error?.message ||
          "Error to handle search references",
      );
    } finally {
      setIsLoading(false);
      setSearchInput("");
    }
  };

  return (
    <div onClick={onClose} className="modal-reference">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="citation">
          <ul className="citation-nav">
            <li
              onClick={() => {
                handlePlaceholderText(
                  "Search for journal article title or DOI",
                  "JOURNAL",
                );
              }}
            >
              <a> Journal</a>
            </li>
          </ul>
          <div className="search">
            <input
              type="text"
              placeholder={placeholderText}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button onClick={handleSearchReferences} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Handle error message */}
        {errorMessage && !isLoading ? (
          <p className="error-text">{errorMessage}</p>
        ) : (
          ""
        )}

        {/* Reference List */}
        {isLoading
          ? ""
          : references &&
            references.map((item) => {
              return (
                <ul key={item.id} className="reference-list">
                  <li onClick={() => setSelectedReference(item)}>
                    {item.title && (
                      <div>
                        <strong>{item.title}</strong>
                      </div>
                    )}

                    {item.publisher && <div>Publisher: {item.publisher}</div>}

                    {item.authors?.length !== 0
                      ? item.authors?.map((author, index) => {
                          return (
                            <span key={index}>
                              {author.firstName} {author.lastName}
                              {index < (item.authors?.length ?? 0) - 1
                                ? ", "
                                : ""}
                            </span>
                          );
                        })
                      : ""}

                    <div className="reference-list details">
                      {item.datePublished && <p>Year: {item.datePublished}</p>}

                      {item.journalName && (
                        <p>Journal Name: {item.journalName}</p>
                      )}

                      {item.volume && <p>Volume: {item.volume}</p>}

                      {item.issue && <p>Issue: {item.issue}</p>}

                      {item.page && <p>Page: {item.page}</p>}

                      {item.doi && <p>URL: {item.doi}</p>}
                    </div>
                  </li>
                </ul>
              );
            })}

        {/* Save Reference */}
        {selectedReference && (
          <div
            className="modal-reference"
            onClick={() => setSelectedReference(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div>
                <button
                  className="close"
                  onClick={() => setSelectedReference(null)}
                >
                  X
                </button>
              </div>

              <div className="header-reference">
                <h3>New {searchType.toLocaleLowerCase()}</h3>
              </div>
              <div>
                <hr />
              </div>

              {selectedReference.title ? (
                <p>
                  <strong>Title:</strong> {selectedReference.title}
                </p>
              ) : (
                ""
              )}

              {selectedReference.authors &&
              selectedReference.authors.length !== 0 ? (
                <div>
                  <strong>Authors: </strong>
                  {selectedReference.authors.map((author, index) => (
                    <span key={index}>
                      {author.firstName} {author.lastName}
                      {index < (selectedReference.authors?.length ?? 0) - 1
                        ? ", "
                        : ""}
                    </span>
                  ))}
                </div>
              ) : (
                ""
              )}

              {selectedReference.journalName && (
                <p>
                  <strong>Journal Name:</strong> {selectedReference.journalName}
                </p>
              )}

              {selectedReference.doi && (
                <p>
                  <strong>DOI:</strong> {selectedReference.doi}
                </p>
              )}

              {selectedReference.publisher && (
                <p>
                  <strong>Publisher:</strong> {selectedReference.publisher}
                </p>
              )}

              {selectedReference.datePublished && (
                <p>
                  <strong>Published Date:</strong>{" "}
                  {selectedReference.datePublished}
                </p>
              )}

              {selectedReference.page && (
                <p>
                  <strong>Page: </strong>
                  {selectedReference.page}
                </p>
              )}

              {selectedReference.volume && (
                <p>
                  <strong>Volume Number:</strong> {selectedReference.volume}
                </p>
              )}

              {selectedReference.issue && (
                <p>
                  <strong>Issue Number:</strong> {selectedReference.issue}
                </p>
              )}

              <button
                disabled={isLoading}
                onClick={() =>
                  handleSaveReference({
                    reference: selectedReference,
                    type: searchType,
                  })
                }
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
