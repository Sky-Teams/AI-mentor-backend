export const toneTypes = ["SIMPLE", "ACADEMIC", "CASUAL", "NATURAL"] as const;
export type ToneType = (typeof toneTypes)[number];

export const toneTypeDescriptions: Record<ToneType, string> = {
  SIMPLE:
    "Use basic, everyday vocabulary. Avoid jargon. Short sentences only. NO complex words",
  ACADEMIC:
    "Use formal, precise, and sophisticated vocabulary. Maintain an objective and professional perspective. Use terms appropriate for research and formal reports.",
  CASUAL:
    "Use friendly, conversational, and relaxed language. Contractions (like 'it's', 'don't') are encouraged. Write as if speaking to a friend.",
  NATURAL:
    "Use standard, well-balanced language that sounds like a native speaker. Neither too formal nor too simple.",
};

export const lengthStrategies = ["SHORTEN", "EXPAND", "MAINTAIN"] as const;
export type LengthStrategy = (typeof lengthStrategies)[number];

export const lengthStrategyDescriptions: Record<LengthStrategy, string> = {
  SHORTEN: "Make the text significantly more concise by removing fluff.",
  EXPAND: "Elaborate more on the ideas and use more descriptive language.",
  MAINTAIN: "Maintain approximately the same length as the original text.",
};

export const paraphraseRunStatuses = [
  "QUEUED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export type ParaphraseRunStatus = (typeof paraphraseRunStatuses)[number];

export interface ParaphraseChange {
  originalPhrase: string;
  replacedWith: string;
  reason: string;
  startIndex?: number;
  endIndex?: number;
}

export interface ParaphraseMetric {
  name: string;
  score: number;
  label: string;
  retionale?: string;
}

export interface GrammarTip {
  ruleName: string;
  explanation: string;
  example?: string;
}

export interface AiPharaphraseResult {
  originalText: string;
  paraphrasedText: string;
  tone?: ToneType;
  changes?: ParaphraseChange[];
  metrics?: ParaphraseMetric[];
  grammarTips?: GrammarTip[];
  readabilityScore: number;
}

export interface ParaphraseRun {
  id: string;
  projectId: string;
  sectionId: string;
  initiatedById: string;
  originalText: string;
  paraphrasedText: string;
  grammarTips?: GrammarTip[];
  tone?: ToneType;
  changes?: ParaphraseChange[];
  metrics?: ParaphraseMetric[];
  aiModel: string;
  preservedWords: string[];
  lengthStrategy: LengthStrategy;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  appCreditsConsumed: number;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}
