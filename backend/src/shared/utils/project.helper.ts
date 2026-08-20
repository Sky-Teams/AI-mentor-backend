import { ProjectSection } from "src/modules/projects/domain/project.js";

const citationMarkerRegex = /{{cite:([^}]+)}}/g;

export const getSectionExportLines = (section: ProjectSection): string[] => {
  const content = section.content;
  const text = content?.text ?? "";
  const references = content?.references?.items ?? [];

  if (text) {
    const citationMap = references.reduce((map, item) => {
      const referenceId =
        "referenceId" in item ? item.referenceId : item.reference?.id;
      if (referenceId) map.set(referenceId, item.formattedText ?? "");
      return map;
    }, new Map<string, string>());

    return text
      .replace(citationMarkerRegex, (_, referenceId: string) => {
        return citationMap.get(referenceId) ?? "";
      })
      .replace(/[ \t]{2,}/g, " ")
      .split("\n");
  }

  return references.length
    ? references.map((item) => item.formattedText ?? "").filter(Boolean)
    : [];
};

export function renderFormattedText(
  doc: PDFKit.PDFDocument,
  text: string,
): void {
  for (const part of text.split(/(<i>.*?<\/i>)/g)) {
    if (!part) continue;

    const italic = part.startsWith("<i>") && part.endsWith("</i>");
    doc
      .font(italic ? "Times-Italic" : "Times-Roman")
      .text(italic ? part.replace(/<\/?i>/g, "") : part, {
        continued: true,
      });
  }

  doc.moveDown();
}

export function renderReferenceText(
  doc: PDFKit.PDFDocument,
  text: string,
): void {
  const left = doc.x;
  const right = doc.page.width - doc.page.margins.right;
  const lineHeight = doc.currentLineHeight(true);
  let cursorX = left;
  let cursorY = doc.y;

  for (const part of text.split(/(<i>.*?<\/i>)/g)) {
    if (!part) continue;

    const italic = part.startsWith("<i>") && part.endsWith("</i>");
    const chunk = italic ? part.replace(/<\/?i>/g, "") : part;

    for (const token of chunk.split(/(\s+)/)) {
      if (!token) continue;

      if (token.includes("\n")) {
        for (const segment of token.split("\n")) {
          if (segment) {
            const width = doc.widthOfString(segment);
            if (cursorX > left && cursorX + width > right) {
              cursorX = left;
              cursorY += lineHeight;
            }

            doc
              .font(italic ? "Times-Italic" : "Times-Roman")
              .text(segment, cursorX, cursorY, { lineBreak: false });
            cursorX += width;
          }

          cursorX = left;
          cursorY += lineHeight;
        }
        continue;
      }

      if (/^\s+$/.test(token)) {
        if (cursorX !== left) {
          cursorX += doc.widthOfString(token);
        }
        continue;
      }

      const width = doc.widthOfString(token);
      if (cursorX > left && cursorX + width > right) {
        cursorX = left;
        cursorY += lineHeight;
      }

      doc
        .font(italic ? "Times-Italic" : "Times-Roman")
        .text(token, cursorX, cursorY, { lineBreak: false });
      cursorX += width;
    }
  }

  doc.x = left;
  doc.y = cursorY + lineHeight;
}
