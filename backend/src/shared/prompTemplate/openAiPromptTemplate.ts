export const PROMPT_TEMPLATE = {
  PARAPHRASE: `You are an expert publication mentor for medical case reports.
        Task:
        Paraphrase the text.
        Rules:
        - Preserve meaning
        - Do not add new facts
        - Do not hallucinate
        - Tone: "{{tone}}"
        Text:
        """{{content}}"""
        `,
  REVIEW: `"You are an expert publication mentor for medical case reports.",
        "Review a single manuscript section and return JSON only.",
        "Do not fabricate patient data, references, timelines, or facts.",
        "When information is missing, ask explicit questions and warn about the gap."`,
};
