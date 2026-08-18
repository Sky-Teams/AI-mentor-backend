import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ParaphrasePanel } from "../components/ParaphrasePanel";
import { ReviewLayout } from "../components/ReviewLayout";
import { ReviewPanel } from "../components/ReviewPanel";
import { SectionChecklistPanel } from "../components/SectionChecklistPanel";
import { projectsApi } from "../services/api/projects";
import { reviewsApi } from "../services/api/reviews";
import type { ProjectSection, ReviewRun, SectionContent } from "../types/api";
import type {
  CreateReferenceInput,
  Reference,
  ReferenceStyle,
} from "../services/api/reference";
import { referenceApi, toSuperscript } from "../services/api/reference";
import {
  InlineCitationModal,
  ReferenceItem,
} from "../components/InlineCitationModal";
import { FigureModal } from "../components/FigureModal";

export const SectionEditorPage = () => {
  const { projectId = "", sectionKey = "" } = useParams();
  const navigate = useNavigate();

  // Basic state
  const [section, setSection] = useState<ProjectSection | null>(null);
  const [allSections, setAllSections] = useState<ProjectSection[]>([]);
  const [reviews, setReviews] = useState<ReviewRun[]>([]);
  const [content, setContent] = useState<SectionContent>({
    text: "",
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [sectionId, setSectionId] = useState("");
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [citationOpen, setCitationOpen] = useState(false);
  const [figureOpen, setFigureOpen] = useState(false);
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [style, setNewStyle] = useState<ReferenceStyle>("APA");

  // Load all data (project + current section + reviews)
  const loadData = async (options?: { preserveContent?: boolean }) => {
    setError("");
    const [project, currentSection, allReviews] = await Promise.all([
      projectsApi.get(projectId),
      projectsApi.getSection(projectId, sectionKey),
      reviewsApi.listProjectReviews(projectId),
    ]);

    setSection(currentSection);
    setSectionId(currentSection.id);
    if (!options?.preserveContent) {
      setContent(currentSection.content);
    }
    setAllSections(project.sections || []);
    setReviews(allReviews);
    const referenceSection = project.sections?.find(
      (section) => section.key === "REFERENCES",
    );
    setNewStyle(referenceSection?.content.references?.style ?? "APA");
  };

  useEffect(() => {
    loadData();
  }, [projectId, sectionKey]);

  // Determine navigation list: if viewing a subsection, navigate among siblings;
  // otherwise navigate among root sections.
  const navigationSections = (() => {
    if (section?.parentSectionId) {
      return allSections.filter(
        (s) => s.parentSectionId === section.parentSectionId,
      );
    }
    return allSections.filter((s) => !s.parentSectionId);
  })();

  const currentIndex = navigationSections.findIndex(
    (s) => s.key === sectionKey,
  );
  const prevSection =
    currentIndex > 0 ? navigationSections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < navigationSections.length - 1
      ? navigationSections[currentIndex + 1]
      : null;
  const isLast = currentIndex === navigationSections.length - 1;

  // subsections of current section
  const subsections = useMemo(
    () => allSections.filter((s) => s.parentSectionId === section?.id),
    [allSections, section],
  );

  // Check if user made changes
  const hasUnsavedChanges =
    section &&
    (section.content.text !== content?.text ||
      JSON.stringify(section.content.media ?? []) !==
        JSON.stringify(content.media ?? []));

  const isMediaSection = sectionKey === "FIGURES AND TABLES";

  const mediaSection = allSections.find(
    (item) => item.key === "FIGURES AND TABLES",
  );

  const mediaItems = content.media ?? mediaSection?.content.media ?? [];

  const escapeHtml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const renderFigureLinks = (value: string) => {
    const safe = escapeHtml(value);
    return safe.replace(
      /\[([^\]]+)\]\(#figure-([^)]+)\)/g,
      '<a href="#figure-$2" class="figure-inline-link">$1</a>',
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      setError("");
      await projectsApi.updateSection(projectId, sectionKey, {
        content,
        changeSummary: "Updated from internal web UI",
      });
      setStatusMessage("Section saved and versioned.");
      await loadData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReview = async () => {
    setIsReviewing(true);
    setStatusMessage(null);
    try {
      setError("");
      await projectsApi.updateSection(projectId, sectionKey, {
        content,
        changeSummary: "Saved before AI review",
      });
      await reviewsApi.triggerReview(projectId, sectionKey);
      setStatusMessage("Review triggered. Refreshing review state...");
      await loadData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsReviewing(false);
    }
  };

  // Navigate to another section (with save check)
  const goToSection = async (targetKey: string) => {
    try {
      setError("");
      if (hasUnsavedChanges) {
        const ok = window.confirm(
          "You have unsaved changes. Save before leaving?",
        );
        if (ok) {
          await projectsApi.updateSection(projectId, sectionKey, {
            content,
            changeSummary: "Saved before navigation",
          });
        }
      }

      navigate(`/projects/${projectId}/sections/${targetKey}`);
      window.scrollTo(0, 0);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const latestSectionReview = useMemo(
    () => reviews.find((r) => r.sectionKey === sectionKey) || null,
    [reviews, sectionKey],
  );

  const countWords = (text: string) => {
    const trimmed = text.trim();
    return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  };

  const referenceSection = allSections.find(
    (item) => item.key === "REFERENCES",
  );

  const projectReferences =
    referenceSection?.content.references?.items?.filter(
      (item): item is CreateReferenceInput & { formattedText: string } =>
        "reference" in item,
    ) ?? [];

  const getItemReferenceId = (item: {
    referenceId?: string;
    reference?: { id?: string };
  }): string => item.referenceId ?? item.reference?.id ?? "";

  // function to save new reference or if style changed save new references format with new style
  const saveReferences = async (
    items: CreateReferenceInput[],
    style: ReferenceStyle,
  ) => {
    if (!referenceSection)
      throw new Error("References section does not exist.");

    const itemsToFormat = items.filter(
      (item): item is Extract<ReferenceItem, { reference: Reference }> =>
        "reference" in item,
    );
    const formattedTexts = await referenceApi.formatReference({
      references: itemsToFormat.map((item) => ({
        reference: item.reference,
        type: item.type,
      })),
      style,
    });
    const updatedReferences = items.map((item, index) => ({
      ...item,
      formattedText: formattedTexts[index],
    }));
    await projectsApi.updateSection(projectId, "REFERENCES", {
      content: {
        ...referenceSection.content,
        references: {
          style: style,
          items: updatedReferences,
        },
      },
      changeSummary: "Update reference style",
    });
    setAllSections((items) =>
      items.map((section) =>
        section.key === "REFERENCES"
          ? {
              ...section,
              content: {
                ...section.content,
                references: {
                  style: style,
                  items: updatedReferences,
                },
              },
            }
          : section,
      ),
    );

    setNewStyle(style);
    return updatedReferences;
  };

  const addProjectReference = async (item: CreateReferenceInput) => {
    if (
      projectReferences.some(
        (reference) => (reference as any).reference?.doi === item.reference.doi,
      )
    ) {
      alert("This reference already exists in the project.");
      return;
    }
    const references = projectReferences
      .filter(
        (ref): ref is CreateReferenceInput & { formattedText: string } =>
          "reference" in ref,
      )
      .map(({ formattedText, ...ref }) => ref);

    await saveReferences([...references, item], style!);
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Could not read the image."));
      reader.readAsDataURL(file);
    });

  const saveMediaSection = async (
    items: NonNullable<SectionContent["media"]>,
  ) => {
    if (!mediaSection) {
      throw new Error("Figures section does not exist.");
    }

    const sourceContent = isMediaSection ? content : mediaSection.content;
    const updatedContent: SectionContent = {
      ...sourceContent,
      media: items,
    };

    await projectsApi.updateSection(projectId, "FIGURES AND TABLES", {
      content: updatedContent,
      changeSummary: "Updated figures",
    });

    setAllSections((sections) =>
      sections.map((item) =>
        item.key === "FIGURES AND TABLES"
          ? { ...item, content: updatedContent }
          : item,
      ),
    );
    setSection((current) =>
      current?.key === "FIGURES AND TABLES"
        ? { ...current, content: updatedContent }
        : current,
    );

    if (isMediaSection) {
      setContent(updatedContent);
    }
  };

  const handleMediaUpload = async () => {
    if (!mediaSection) {
      setError("Figures section does not exist.");
      return;
    }

    if (!mediaFile || !mediaCaption.trim()) {
      setError("Please choose an image and add a caption.");
      return;
    }

    setMediaLoading(true);
    setError("");
    try {
      const src = await readFileAsDataUrl(mediaFile);
      const nextItem = {
        id: crypto.randomUUID(),
        label: `Fig. ${mediaItems.length + 1}`,
        caption: mediaCaption.trim(),
        src,
        createdAt: new Date().toISOString(),
      };

      await saveMediaSection([...mediaItems, nextItem]);
      setMediaCaption("");
      setMediaFile(null);
      setStatusMessage("Figure uploaded successfully.");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setMediaLoading(false);
    }
  };

  // citations are stored as {{cite:refId}} markers in content.text,
  // and swapped for the real formatted text only when shown to the user
  const getShownText = () => {
    let text = content.text;
    const items = content.references?.items || [];

    let index = 1;

    for (const item of items) {
      const placeholder = `{{cite:${getItemReferenceId(item)}}}`;

      if (
        content.references?.style === "CHICAGO_FULL_NOTE" ||
        content.references?.style === "OSCOLA"
      ) {
        const number = toSuperscript(index);
        text = text.split(placeholder).join(number);
        index++;
      } else {
        text = text.split(placeholder).join(item.formattedText);
      }
    }

    // Replace figure placeholders with their labels
    for (const figure of mediaItems) {
      const figurePlaceholder = `{{figure:${figure.id}}}`;

      if (sectionKey === "CASE REPORTS") {
        // Render as clickable link that navigates to the figure
        text = text
          .split(figurePlaceholder)
          .join(
            `<a href="#figure-${figure.id}" class="figure-inline-link" data-figure-id="${figure.id}">${figure.label}</a>`,
          );
      } else {
        // New format: {{figure:id}}
        text = text.split(figurePlaceholder).join(figure.label);
      }

      // Old format stored in DB: [text](#figure-id)
      const oldFigurePattern = new RegExp(
        `\\[[^\\]]*\\]\\(#figure-${figure.id}\\)`,
        "g",
      );
      text = text.replace(oldFigurePattern, figure.label);
    }

    return text;
  };

  const getRawText = (
    shownText: string,
    items = content.references?.items || [],
  ) => {
    // Strip HTML tags from contentEditable content (CASE REPORTS)
    let text = shownText.replace(/<[^>]*>/g, "");

    if (
      content.references?.style === "CHICAGO_FULL_NOTE" ||
      content.references?.style === "OSCOLA"
    ) {
      items.forEach((item, index) => {
        const number = toSuperscript(index + 1);
        const placeholder = `{{cite:${getItemReferenceId(item)}}}`;

        text = text.split(number).join(placeholder);
      });
    } else {
      for (const item of items) {
        if (item.formattedText)
          text = text
            .split(item.formattedText)
            .join(`{{cite:${getItemReferenceId(item)}}}`);
      }
    }

    // Convert figure labels back to placeholders
    for (const figure of mediaItems) {
      const figurePlaceholder = `{{figure:${figure.id}}}`;
      text = text.split(figure.label).join(figurePlaceholder);
    }

    return text;
  };

  const insertCitation = async (
    citation: { formattedText?: string; footnote?: string },
    reference: Reference,
  ) => {
    if (!selection) return;

    const alreadyUsed = projectReferences.some(
      (r) => getItemReferenceId(r) === reference.id,
    );
    if (!alreadyUsed && referenceSection) {
      await addProjectReference({ reference, type: "JOURNAL" });
    }

    const items = content.references?.items || [];
    const alreadyInSection = items.some(
      (r) => getItemReferenceId(r) === reference.id,
    );
    const updatedItems = alreadyInSection
      ? items
      : [
          ...items,
          {
            referenceId: reference.id,
            formattedText: citation.formattedText,
            footnote: citation.footnote,
          },
        ];

    const shown = getShownText();
    const citationText =
      style === "OSCOLA" || style === "CHICAGO_FULL_NOTE"
        ? `{{cite:${reference.id}}}`
        : citation.formattedText;

    const newShown =
      shown.slice(0, selection.end) +
      " " +
      citationText +
      shown.slice(selection.end);

    const newText = getRawText(newShown, updatedItems);
    // Insert citation text into the current section and store the reference
    const updatedContent: SectionContent = {
      ...content,
      text: newText,
      references: {
        style,
        items: updatedItems,
      },
    };

    setContent(updatedContent);
    setAllSections((prev) =>
      prev.map((s) =>
        s.key === sectionKey ? { ...s, content: updatedContent } : s,
      ),
    );
    setSelection(null);

    // save the updated section to the database
    try {
      setError("");
      await projectsApi.updateSection(projectId, sectionKey, {
        content: updatedContent,
        changeSummary: "Added inline citation",
      });
      setStatusMessage("Citation inserted and saved.");
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Failed to save citation.",
      );
    }
  };

  const updateCitationStyle = async (style: ReferenceStyle) => {
    const updatedSections = [];
    for (const section of allSections) {
      const sourceContent =
        section.key === sectionKey ? content : section.content;

      if (
        !section.content.references?.items?.length ||
        section.key === "REFERENCES"
      ) {
        updatedSections.push({
          ...section,
          content: {
            ...sourceContent,
            references: {
              ...sourceContent.references,
              style,
              item: [],
            },
          },
        });
        continue;
      }

      const items = section.content.references.items.filter(
        (
          item,
        ): item is Extract<
          ReferenceItem,
          { referenceId: string; formattedText?: string; footnote?: string }
        > => "referenceId" in item,
      );

      let sectionReferences: {
        reference: Reference;
        referenceIndex: number;
      }[] = [];

      for (const item of items) {
        const reference = projectReferences.find(
          (reference) => reference.reference.id === item.referenceId,
        );

        if (!reference) continue;
        const index =
          projectReferences.findIndex(
            (reference) => reference.reference.id === item.referenceId,
          ) + 1;

        sectionReferences.push({
          reference: reference.reference,
          referenceIndex: index,
        });
      }

      if (!sectionReferences.length) {
        updatedSections.push(section);
        continue;
      }

      const formattedCitations = await referenceApi.formatInlineCitation({
        references: sectionReferences,
        style,
      });

      const updatedItems = items.map((item) => {
        const formatted = formattedCitations.find(
          (citation) => citation.referenceId === item.referenceId,
        );

        return {
          ...item,
          formattedText: formatted?.formattedText ?? item.formattedText,
          footnote: formatted?.footnote ?? item.footnote,
        };
      });

      const updatedContent: SectionContent = {
        ...sourceContent,
        references: {
          ...sourceContent.references,
          style,
          items: updatedItems,
        },
      };

      await projectsApi.updateSection(projectId, section.key, {
        content: updatedContent,
      });

      updatedSections.push({ ...section, content: updatedContent });
    }

    setAllSections(updatedSections);

    const currentSection = updatedSections.find(
      (section) => section.key === sectionKey,
    );
    if (currentSection) setContent(currentSection.content);
  };

  const handleStyleChange = async (newStyle: ReferenceStyle) => {
    const references = projectReferences.filter(
      (ref): ref is CreateReferenceInput & { formattedText: string } =>
        "reference" in ref && "type" in ref,
    );

    await saveReferences(
      references.map(({ formattedText, ...item }) => item),
      newStyle,
    );

    await updateCitationStyle(newStyle);

    setNewStyle(newStyle);
  };

  const insertFigure = async (
    figure: NonNullable<SectionContent["media"]>[number],
  ) => {
    if (!selection) return;

    const shown = getShownText();
    const figurePlaceholder = `{{figure:${figure.id}}}`;

    const newShown =
      shown.slice(0, selection.start) +
      figurePlaceholder +
      shown.slice(selection.end);

    const newText = getRawText(newShown);

    const updatedContent: SectionContent = {
      ...content,
      text: newText,
    };

    setContent(updatedContent);
    setAllSections((prev) =>
      prev.map((s) =>
        s.key === sectionKey ? { ...s, content: updatedContent } : s,
      ),
    );
    setFigureOpen(false);
    setSelection(null);

    try {
      setError("");
      await projectsApi.updateSection(projectId, sectionKey, {
        content: updatedContent,
        changeSummary: "Added figure reference",
      });
      setStatusMessage("Figure inserted and saved.");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Failed to save figure.");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Section Editor</p>
          <h1>{section?.title ?? sectionKey}</h1>
          <p className="muted-text">
            <Link to={`/projects/${projectId}`}>Back to project</Link>
          </p>
        </div>

        <div className="button-row">
          <button
            className="secondary-button"
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            className="primary-button"
            onClick={handleReview}
            type="button"
            disabled={!content || content.text.length === 0}
          >
            {isReviewing ? "Reviewing..." : "Trigger Review"}
          </button>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {statusMessage ? <p className="success-text">{statusMessage}</p> : null}
      <div className="content-layout">
        <div className="two-column-grid">
          <div className="section-editor__content-shell">
            <div className="card section-editor__content-card">
              <div className="card-header">
                <h3>Content</h3>
                {hasUnsavedChanges && (
                  <span className="badge warning">Unsaved</span>
                )}
              </div>
              {sectionKey === "REFERENCES" ? (
                referenceSection?.content.references?.items?.map((item) => (
                  <li
                    style={{ margin: "15px" }}
                    dangerouslySetInnerHTML={{
                      __html: item.formattedText ?? "",
                    }}
                  />
                ))
              ) : isMediaSection ? (
                <div className="stack" style={{ gap: "1rem" }}>
                  <div className="card" style={{ padding: "1rem" }}>
                    <div className="stack" style={{ gap: "0.75rem" }}>
                      <input
                        className="modern-input"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setMediaFile(event.target.files?.[0] ?? null)
                        }
                      />
                      <input
                        className="modern-input"
                        type="text"
                        value={mediaCaption}
                        onChange={(event) =>
                          setMediaCaption(event.target.value)
                        }
                        placeholder="Add a caption for this figure"
                      />
                      <button
                        className="primary-button"
                        disabled={mediaLoading}
                        onClick={handleMediaUpload}
                        type="button"
                      >
                        {mediaLoading ? "Uploading..." : "Add figure"}
                      </button>
                    </div>
                  </div>

                  <div className="stack" style={{ gap: "0.75rem" }}>
                    {mediaItems.length ? (
                      mediaItems.map((item) => (
                        <div
                          key={item.id}
                          id={`figure-${item.id}`}
                          className="card"
                          style={{ padding: "1rem" }}
                        >
                          <div className="figure-card">
                            <img
                              className="figure-card__img"
                              src={item.src}
                              alt={item.caption}
                            />
                            <div className="figure-card__meta">
                              <strong className="figure-card__label">
                                {item.label}.
                              </strong>
                              <p className="figure-card__caption">
                                {item.caption}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="muted-text">No figures uploaded yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {sectionKey === "CASE REPORTS" ? (
                    <div
                      className="editor-area editor-area--rich"
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: getShownText() }}
                      onInput={(event) => {
                        const value = event.currentTarget.innerText;
                        setContent((prev) => ({
                          ...prev,
                          text: getRawText(value),
                        }));
                      }}
                      onSelect={(event) => {
                        const selection = window.getSelection();
                        if (selection && !selection.isCollapsed) {
                          setSelection({
                            start: selection.anchorOffset,
                            end: selection.focusOffset,
                          });
                        } else {
                          setSelection(null);
                        }
                      }}
                      onClick={(event) => {
                        const target = event.target as HTMLElement;
                        const link = target.closest("a[data-figure-id]");
                        if (link) {
                          event.preventDefault();
                          const figureId = link.getAttribute("data-figure-id");
                          if (figureId) {
                            navigate(
                              `/projects/${projectId}/sections/FIGURES%20AND%20TABLES`,
                            );
                            setTimeout(() => {
                              document
                                .getElementById(`figure-${figureId}`)
                                ?.scrollIntoView({ behavior: "smooth" });
                            }, 300);
                          }
                        }
                      }}
                    />
                  ) : (
                    <textarea
                      style={
                        (section?.maxWords as number) <
                        countWords(content.text || "")
                          ? { border: "1px solid red", outline: "none" }
                          : { outline: "none" }
                      }
                      className="editor-area"
                      onChange={(event) => {
                        const value = event.target.value;

                        setContent((prev) => ({
                          ...prev,
                          text:
                            style === "CHICAGO_FULL_NOTE" || style === "OSCOLA"
                              ? value
                              : getRawText(value),
                        }));
                      }}
                      onSelect={(event) => {
                        const { selectionStart: start, selectionEnd: end } =
                          event.currentTarget;
                        setSelection(start !== end ? { start, end } : null);
                      }}
                      rows={10}
                      value={getShownText()}
                    />
                  )}

                  <div className="stack" style={{ marginTop: "0.75rem" }}>
                    {selection && (
                      <div className="button-row">
                        {sectionKey === "CASE REPORTS" ? (
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => setFigureOpen(true)}
                          >
                            Add figure
                          </button>
                        ) : (
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => setCitationOpen(true)}
                          >
                            Add citation
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {sectionKey !== "REFERENCES" && (
                <div>
                  <span
                    style={{
                      color: "green",
                      fontSize: "12px",
                      backgroundColor: "#f6f7fb",
                    }}
                    className="badge"
                  >
                    Max words {section?.maxWords}
                  </span>
                  <span className="badge" style={{ float: "right" }}>
                    {countWords(content.text || "")} Words
                  </span>
                </div>
              )}
            </div>

            <div className="section-editor__checklist-divider">
              <SectionChecklistPanel
                section={section}
                projectId={projectId}
                sectionKey={sectionKey}
                onChanged={() => loadData({ preserveContent: true })}
              />
            </div>
          </div>

          <ReviewPanel review={latestSectionReview} />
        </div>
        <ReviewLayout review={latestSectionReview} />
      </div>
      {/* subsections LIST */}
      {subsections.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <h3>subsections</h3>
            <span className="badge">{subsections.length}</span>
          </div>
          <div className="stack">
            {subsections.map((sub) => (
              <Link
                key={sub.id}
                className="section-link"
                to={`/projects/${projectId}/sections/${sub.key}`}
                style={{
                  paddingLeft: "0.75rem",
                  borderLeft: "3px solid #e5e7eb",
                }}
              >
                <div>
                  <strong>{sub.title}</strong>
                  <p className="muted-text">
                    {sub.status} {sub.isOptional ? "· Optional" : ""}
                  </p>
                </div>
                <span>{sub.content.text.trim().length} Words</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <ParaphrasePanel
        sectionId={sectionId}
        content={content.text}
        sectionKey={sectionKey}
        onSaveSuccess={loadData}
      />

      {citationOpen && (
        <InlineCitationModal
          references={projectReferences}
          onAddReference={addProjectReference}
          onClose={() => setCitationOpen(false)}
          onInsert={insertCitation}
          onStyleChange={handleStyleChange}
          style={style!}
        />
      )}
      {figureOpen && (
        <FigureModal
          figures={mediaItems}
          onClose={() => setFigureOpen(false)}
          onSelect={insertFigure}
        />
      )}
      {/* Navigation buttons */}
      <div
        className="button-row"
        style={{ justifyContent: "space-between", marginTop: "1rem" }}
      >
        <button
          className="secondary-button"
          onClick={() => prevSection && goToSection(prevSection.key)}
          disabled={!prevSection}
          type="button"
        >
          {"\u2190"} Previous
        </button>

        <button
          className="primary-button"
          onClick={() => {
            if (nextSection) {
              goToSection(nextSection.key);
            } else if (isLast) {
              navigate(`/projects/${projectId}`);
            }
          }}
          type="button"
        >
          {isLast ? `Finish ${"\u2192"}` : `Next ${"\u2192"}`}
        </button>
      </div>
      <p className="muted-text">
        Reminder: AI feedback is helpful, but please have a human review it
        before you act on it.
      </p>
    </div>
  );
};
