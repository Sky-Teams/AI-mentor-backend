import { ProjectSection } from "src/modules/projects/domain/project.js";

const citationMarkerRegex = /{{cite:([^}]+)}}/g;

export const getSectionExportLines = (section: ProjectSection): string[] => {
  const rawText = section.content?.text ?? "";
  const references = section.content?.references?.items ?? [];

  if (rawText.length > 0) {
    const citationMap = new Map<string, string>();
    for (const item of references) {
      const referenceId =
        "referenceId" in item ? item.referenceId : item.reference?.id;
      if (referenceId) {
        citationMap.set(referenceId, item.formattedText || "");
      }
    }

    const replacedText = rawText
      .replace(citationMarkerRegex, (_, referenceId: string) => {
        return citationMap.get(referenceId) ?? "";
      })
      .replace(/[ \t]{2,}/g, " ");

    // split into separate lines , so PDFKit renders them correctly
    return replacedText.split("\n");
  }

  if (references.length > 0) {
    return references.map((item) => item.formattedText).filter(Boolean);
  }

  return [];
};

export function renderFormattedText(
  doc: PDFKit.PDFDocument,
  text: string,
): void {
  const parts = text.split(/(<i>.*?<\/i>)/g);

  for (const part of parts) {
    if (part.startsWith("<i>") && part.endsWith("</i>")) {
      const clean = part.replace(/<\/?i>/g, "");
      doc.font("Times-Italic").text(clean, { continued: true });
    } else if (part.length > 0) {
      doc.font("Times-Roman").text(part, { continued: true });
    }
  }

  doc.text("");
}
