import path from "node:path";
import { readFileSync } from "node:fs";
import {
  AlignmentType,
  ImageRun,
  Paragraph,
  TextRun,
} from "docx";
import { ProjectSection } from "src/modules/projects/domain/project.js";

const citationMarkerRegex = /{{cite:([^}]+)}}/g;
const figureMarkerRegex = /{{figure:([^}]+)}}/g;
const figureTableParentheticalRegex =
  /\(\s*(fig(?:ture)?|table)\s*[:#-]?\s*([^)]+?)\s*\)/gi;
const htmlTokenRegex = /(<[^>]+>|[^<]+)/g;

type ExportReferenceItem = {
  referenceId?: string;
  reference?: {
    id?: string;
  };
  formattedText?: string;
};

export type ExportMediaItem = {
  id: string;
  label: string;
  caption: string;
  src: string;
  createdAt: string;
};

type GetSectionExportLinesOptions = {
  mediaItems?: ExportMediaItem[];
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

const buildMediaMap = (
  mediaItems: ExportMediaItem[],
): Map<string, string> =>
  mediaItems.reduce<Map<string, string>>((map, item) => {
    map.set(item.id, item.label);
    return map;
  }, new Map<string, string>());

export const getSectionExportLines = (
  section: ProjectSection,
  options?: GetSectionExportLinesOptions,
): string[] => {
  const text = section.content?.text?.trim() ?? "";
  const references = (section.content?.references?.items ??
    []) as ExportReferenceItem[];
  const mediaItems = options?.mediaItems ?? [];

  if (text) {
    const citationMap = buildCitationMap(references);
    const mediaMap = buildMediaMap(mediaItems);

    return text
      .replace(citationMarkerRegex, (_, referenceId: string) => {
        return citationMap.get(referenceId) ?? "";
      })
      .replace(figureMarkerRegex, (_, figureId: string) => {
        return mediaMap.get(figureId) ?? "";
      })
      .replace(figureTableParentheticalRegex, (_match, figType1, value1) => {
        const type = String(figType1 ?? "").toLowerCase();
        const value = String(value1 ?? "").trim();
        return type.startsWith("table") ? `Table ${value}` : `Fig. ${value}`;
      })
      .replace(/[ \t]{2,}/g, " ")
      .split(/\r?\n/)
      .filter((line) => line.trim());
  }

  return references.length
    ? references.map((item) => item.formattedText ?? "").filter(Boolean)
    : [];
};

export function readMediaBuffer(src: string): Buffer | null {
  try {
    const url = new URL(src);
    const localPath = path.resolve(
      process.cwd(),
      url.pathname.replace(/^\/+/, ""),
    );
    return readFileSync(localPath);
  } catch {
    try {
      return readFileSync(path.resolve(process.cwd(), src.replace(/^\/+/, "")));
    } catch {
      return null;
    }
  }
}

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

export function renderFigureMedia(
  doc: PDFKit.PDFDocument,
  media: ExportMediaItem[],
): void {
  if (!media.length) return;

  doc.moveDown(0.5);

  for (const item of media) {
    const imageBuffer = readMediaBuffer(item.src);
    if (!imageBuffer) continue;

    doc.image(imageBuffer, {
      fit: [Math.min(doc.page.width - 150, 420), 220],
      align: "center",
    });
    doc.font("Times-Bold").fontSize(10).text(item.label, {
      align: "center",
    });
    if (item.caption) {
      doc.font("Times-Roman").fontSize(9).text(item.caption, {
        align: "center",
      });
    }
    doc.moveDown(0.5);
  }
}

export function renderWordFigureMedia(
  paragraphs: Paragraph[],
  media: ExportMediaItem[],
): void {
  for (const item of media) {
    const imageBuffer = readMediaBuffer(item.src);
    if (!imageBuffer) continue;

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: { width: 450, height: 300 },
          } as any),
        ],
      }),
    );

    paragraphs.push(
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: item.label, bold: true })],
      }),
    );

    paragraphs.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: item.caption })],
      }),
    );
  }
}
