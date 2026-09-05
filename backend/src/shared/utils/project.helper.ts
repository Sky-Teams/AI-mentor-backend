import path from "node:path";
import { readFileSync } from "node:fs";
import { AlignmentType, ImageRun, Paragraph, TextRun } from "docx";
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

const buildMediaMap = (mediaItems: ExportMediaItem[]): Map<string, string> =>
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

function findImageType(src: string): "png" | "jpg" | "gif" | "bmp" {
  const rawPath = (() => {
    try {
      return new URL(src).pathname;
    } catch {
      return src;
    }
  })();

  const extension = path.extname(rawPath).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") return "jpg";
  if (extension === ".gif") return "gif";
  if (extension === ".bmp") return "bmp";
  return "png";
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

    const textWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const image = (
      doc as PDFKit.PDFDocument & {
        openImage: (buffer: Buffer) => { width: number; height: number };
      }
    ).openImage(imageBuffer);
    const maxImageHeight = 280;
    const scale = Math.min(
      textWidth / image.width,
      maxImageHeight / image.height,
    );
    const imageWidth = image.width * scale;
    const imageHeight = image.height * scale;
    const captionHeight = 34;

    if (
      doc.y + imageHeight + captionHeight >
      doc.page.height - doc.page.margins.bottom
    ) {
      doc.addPage();
      doc.moveDown(0.5);
    }

    const imageX = doc.page.margins.left + (textWidth - imageWidth) / 2;
    const imageY = doc.y;

    doc.image(imageBuffer, imageX, imageY, {
      width: imageWidth,
      height: imageHeight,
    });

    doc.y = imageY + imageHeight + 12;

    const labelText = item.caption ? `${item.label}. ` : item.label;
    const captionText = item.caption ?? "";
    const labelWidth = doc.widthOfString(labelText);
    const captionWidth = item.caption ? doc.widthOfString(captionText) : 0;
    const combinedWidth = labelWidth + captionWidth;
    const startX = doc.page.margins.left + (textWidth - combinedWidth) / 2;

    doc.font("Times-Bold").fontSize(10).text(labelText, startX, doc.y, {
      lineBreak: false,
    });
    if (item.caption) {
      doc.font("Times-Roman").fontSize(10).text(captionText, {
        continued: false,
        lineBreak: false,
      });
    }

    doc.moveDown(2);
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
            type: findImageType(item.src),
            data: imageBuffer,
            transformation: { width: 450, height: 300 },
          }),
        ],
      }),
    );

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: item.caption
          ? [
              new TextRun({ text: `${item.label}. `, bold: true }),
              new TextRun({ text: item.caption }),
            ]
          : [new TextRun({ text: item.label, bold: true })],
      }),
    );
  }
}
