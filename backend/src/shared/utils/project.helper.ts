import { ProjectSection } from "src/modules/projects/domain/project.js";

const citationMarkerRegex = /{{cite:([^}]+)}}/g;

export const getSectionExportText = (section: ProjectSection): string => {
  const rawText = section.content?.text ?? "";
  const references = section.content?.references?.items ?? [];

  if (rawText.length === 0) {
    return "";
  }

  const citationMap = new Map<string, string>();
  for (const item of references) {
    const referenceId =
      "referenceId" in item ? item.referenceId : item.reference?.id;

    if (referenceId) {
      citationMap.set(referenceId, item.formattedText);
    }
  }

  return rawText
    .replace(citationMarkerRegex, (_, referenceId: string) => {
      return citationMap.get(referenceId) ?? "";
    })
    .replace(/[ \t]{2,}/g, " ");
};
