import { useEffect, useState } from "react";
import { ReferenceSearchPanel } from "../components/referenceSearchPanel";
import {
  addReference,
  CreateReferenceInput,
  getReferences,
  LocalReferences,
  referenceApi,
  ReferenceStyle,
  referenceStyles,
} from "../services/api/reference";
import { Project, SectionContent } from "../types/api";
import { projectsApi } from "../services/api/projects";

export const ReferencePage = () => {
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false);
  const [saveReferences, setSaveReferences] = useState<LocalReferences[]>([]);
  const [currentStyle, setCurrentStyle] = useState<ReferenceStyle>("APA");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenProjectModal, setIsOpenProjectModal] = useState(false);
  const [message, setMessage] = useState("");
  const [listProjects, setListProjects] = useState<Project[]>([]);
  const [selectedReference, setSelectedReference] = useState<LocalReferences>();

  useEffect(() => {
    const references = getReferences();
    setSaveReferences(references);
  }, []);

  const handleAddReference = async (references: CreateReferenceInput) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setMessage("");
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

      const result = addReference(newReference as unknown as LocalReferences);
      if (typeof result === "boolean" && result === true)
        setMessage("Reference already exist.");

      setSaveReferences(getReferences());
      setIsSearchBoxOpen(false);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleChange = async (newStyle: ReferenceStyle) => {
    try {
      setCurrentStyle(newStyle);
      setIsLoading(true);
      setErrorMessage("");
      setMessage("");

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
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProjectModal = async (reference: LocalReferences) => {
    setSelectedReference(reference);
    const projectList = await projectsApi.list();
    setListProjects(projectList);
    setIsOpenProjectModal(true);
  };

  const handleSaveToSectionReference = async (
    reference: LocalReferences,
    projectId: string,
    style: ReferenceStyle,
  ) => {
    const project = await projectsApi.get(projectId);

    // Check for exist of the references section
    const referenceSection = project.sections!.find(
      (section) => section.key === "REFERENCES",
    );

    if (!referenceSection) {
      setErrorMessage("References Section does not exist.");
      setMessage("");
      setIsOpenProjectModal(false);
      return;
    }

    const oldContent = referenceSection?.content || {
      text: "",
      references: {
        style: "APA",
        items: [],
      },
    };

    const exist = oldContent?.references?.items?.some(
      (item) => item?.reference?.id === reference.id,
    );

    if (exist) {
      setIsOpenProjectModal(false);
      setErrorMessage("");
      setMessage("Reference already exists");
      return;
    }

    try {
      const newContent = {
        ...oldContent,
        references: exist
          ? oldContent.references
          : {
              style: style,
              items: [
                ...(oldContent?.references?.items ?? []),
                {
                  reference: reference.raw,
                  type: reference.type,
                  formattedText: reference.text,
                },
              ],
            },
      };

      await projectsApi.updateSection(projectId, "REFERENCES", {
        content: newContent as SectionContent,
      });
      setMessage("Reference add successfully");
      setIsOpenProjectModal(false);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsOpenProjectModal(false);
    }
  };
  return (
    <div>
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {message && <p className="success-text">{message}</p>}

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
            {referenceStyles.map((item, index) => (
              <option value={item.value} key={index} disabled={isLoading}>
                {isLoading ? "Loading..." : item.title}
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
              return (
                <div key={item.id || index}>
                  <li
                    key={item.id || index}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                  <button
                    type="submit"
                    onClick={() => handleOpenProjectModal(item)}
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      border: "none",
                      padding: "5px",
                      borderRadius: "5px",
                    }}
                  >
                    Save to reference
                  </button>
                </div>
              );
            })}
          </ul>
        ) : (
          <p style={{ color: "#888" }}>No reference yet.</p>
        )}

        {isOpenProjectModal && (
          <div
            onClick={() => setIsOpenProjectModal(false)}
            className="modal-reference"
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Projects List</h3>
              {listProjects.map((item) => {
                return (
                  <ul key={item.id} className="reference-list">
                    <li
                      onClick={() => {
                        if (!selectedReference) return;
                        handleSaveToSectionReference(
                          selectedReference,
                          item.id,
                          currentStyle,
                        );
                      }}
                    >
                      {item.title}
                    </li>
                  </ul>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
