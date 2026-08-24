import { ProjectSection } from "src/modules/projects/domain/project.js";

const citationMarkerRegex = /{{cite:([^}]+)}}/g;
const htmlTokenRegex = /(<[^>]+>|[^<]+)/g;

type ExportReferenceItem = {
  referenceId?: string;
  reference?: {
    id?: string;
  };
  formattedText?: string;
};

const getFormattedParts = (
  text: string,
): Array<{ text: string; italic: boolean }> => {
  const parts: Array<{ text: string; italic: boolean }> = [];
  let isItalic = false;

  for (const token of text.match(htmlTokenRegex) ?? []) {
    if (token.startsWith("<")) {
      if (/^<(i|em)>$/i.test(token)) isItalic = true;
      else if (/^<\/(i|em)>$/i.test(token)) isItalic = false;
      else if (/^<br\s*\/?>$/i.test(token))
        parts.push({ text: "\n", italic: false });
      continue;
    }
    parts.push({ text: token, italic: isItalic });
  }

  return parts;
};

const buildCitationMap = (references: ExportReferenceItem[]) =>
  references.reduce<Map<string, string>>((map, item) => {
    const referenceId = item.referenceId ?? item.reference?.id;
    if (referenceId) {
      map.set(referenceId, item.formattedText ?? "");
    }
    return map;
  }, new Map<string, string>());

export const getSectionExportLines = (section: ProjectSection): string[] => {
  const text = section.content?.text?.trim() ?? "";
  const references = (section.content?.references?.items ??
    []) as ExportReferenceItem[];

  if (text) {
    const citationMap = buildCitationMap(references);

    return text
      .replace(citationMarkerRegex, (_, referenceId: string) => {
        return citationMap.get(referenceId) ?? "";
      })
      .replace(/[ \t]{2,}/g, " ")
      .split(/\r?\n/)
      .filter((line) => line.trim());
  }

  return references.length
    ? references.map((item) => item.formattedText ?? "").filter(Boolean)
    : [];
};

export function renderFormattedText(
  doc: PDFKit.PDFDocument,
  text: string,
): void {
  const parts = getFormattedParts(text);

  for (const [index, part] of parts.entries()) {
    doc.font(part.italic ? "Times-Italic" : "Times-Roman").text(part.text, {
      continued: index < parts.length - 1,
    });
  }

  doc.x = doc.page.margins.left;
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

  for (const part of getFormattedParts(text)) {
    const style = part.italic ? "Times-Italic" : "Times-Roman";

    for (const token of part.text.split(/(\s+)/)) {
      if (!token) continue;

      if (token.includes("\n")) {
        const segments = token.split(/\r?\n/);

        for (const [index, segment] of segments.entries()) {
          if (segment) {
            const width = doc.widthOfString(segment);
            if (cursorX > left && cursorX + width > right) {
              cursorX = left;
              cursorY += lineHeight;
            }

            doc.font(style).text(segment, cursorX, cursorY, {
              lineBreak: false,
            });
            cursorX += width;
          }

          if (index < segments.length - 1) {
            cursorX = left;
            cursorY += lineHeight;
          }
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

      doc.font(style).text(token, cursorX, cursorY, { lineBreak: false });
      cursorX += width;
    }
  }

  doc.x = left;
  doc.y = cursorY + lineHeight;
}
