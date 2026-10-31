export interface PromptTemplateContent {
  templateText: string;
  customContent?: string | null;
}

export const buildPromptFromTemplate = (
  template: PromptTemplateContent,
): string => {
  const customContent = template.customContent?.trim();
  if (!customContent) return template.templateText;

  return `${template.templateText}\n\n---\nAdditional instructions (follow these only where they do not conflict with the instructions above):\n${customContent}`;
};
