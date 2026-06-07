import React, { useEffect, useState } from "react";
import {
  Reference,
  referenceApi,
  ReferenceTypes,
} from "../services/api/reference";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveReference: (
    selectedReference: Reference,
    searchType: ReferenceTypes,
  ) => Promise<void>;
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
  const [inputSearch, setInputSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [references, setReferences] = useState<Reference[] | []>([]);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      setInputSearch("");
      setReferences([]);
      setIsLoading(false);
      setSelectedReference(null);
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Hanlde Placeholder Text
  const handlePlaceholderText = (
    newPlaceholder: string,
    type: ReferenceTypes,
  ) => {
    setPlaceholderText(newPlaceholder);
    setSearchType(type);
  };

  // Handle Input Search
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSearch(event.target.value);
  };

  // Handle Save Reference
  const handleSaveClick = async (item: Reference) => {
    try {
      setIsLoading(true);
      await onSaveReference(item, searchType);
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error?.message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferences = async () => {
    const isIdentifier = inputSearch.includes("/") || /\d/.test(inputSearch);
    let searcParams = {};
    setIsLoading(true);
    searcParams = isIdentifier ? { doi: inputSearch } : { title: inputSearch };
    try {
      const references = await referenceApi.getReferences(
        searcParams,
        searchType,
      );
      if (Array.isArray(references)) {
        setReferences(references);
      } else if (references && typeof references === "object") {
        setReferences([references]);
      } else {
        setErrorMessage("Result was not found");
      }
    } catch (error: any) {
      setReferences([]);
      setErrorMessage(error?.response?.data?.error?.message);
      console.log(error);
    } finally {
      setIsLoading(false);
      setInputSearch("");
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
              <a href="#">Journal</a>
            </li>
          </ul>
          <div className="search">
            <input
              type="text"
              placeholder={placeholderText}
              value={inputSearch}
              onChange={handleInputChange}
            />
            <button onClick={handleReferences} disabled={isLoading}>
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
            references.map((item, index) => {
              return (
                <ul key={item.id || index} className="reference-list">
                  <li onClick={() => setSelectedReference(item)}>
                    <a href="#">
                      {item.title ? (
                        <div>
                          <strong>{item.title}</strong>
                        </div>
                      ) : (
                        ""
                      )}
                      {item.publisher ? (
                        <div>Publisher: {item.publisher}</div>
                      ) : (
                        ""
                      )}
                      {item.authors?.length !== 0 &&
                        item.authors?.map((author, index) => {
                          return (
                            <span key={index}>
                              {author.firstName} {author.lastName},{" "}
                            </span>
                          );
                        })}

                      <div className="reference-list details">
                        {item.datePublished ? (
                          <p>Year: {item.datePublished}</p>
                        ) : (
                          ""
                        )}

                        {item.journalName ? (
                          <p>Journal Name: {item.journalName}</p>
                        ) : (
                          ""
                        )}

                        {item.volume ? <p>Volume: {item.volume}</p> : ""}

                        {item.issue ? <p>Isuue: {item.issue}</p> : ""}

                        {item.page ? <p>Page: {item.page}</p> : ""}

                        {item.doi ? <p>URL: {item.doi}</p> : ""}
                      </div>
                    </a>
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

              {selectedReference.journalName ? (
                <p>
                  <strong>Journal Name:</strong> {selectedReference.journalName}
                </p>
              ) : (
                ""
              )}

              {selectedReference.doi ? (
                <p>
                  <strong>DOI:</strong> {selectedReference.doi}
                </p>
              ) : (
                ""
              )}

              {selectedReference.publisher ? (
                <p>
                  <strong>Publisher:</strong> {selectedReference.publisher}
                </p>
              ) : (
                ""
              )}

              {selectedReference.datePublished ? (
                <p>
                  <strong>Published Date:</strong>{" "}
                  {selectedReference.datePublished}
                </p>
              ) : (
                ""
              )}

              {selectedReference.page ? (
                <p>
                  <strong>Page: </strong>
                  {selectedReference.page}
                </p>
              ) : (
                ""
              )}

              {selectedReference.volume ? (
                <p>
                  <strong>Volume Number:</strong> {selectedReference.volume}
                </p>
              ) : (
                ""
              )}

              {selectedReference.issue ? (
                <p>
                  <strong>Issue Number:</strong> {selectedReference.issue}
                </p>
              ) : (
                ""
              )}
              <button onClick={() => handleSaveClick(selectedReference)}>
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
