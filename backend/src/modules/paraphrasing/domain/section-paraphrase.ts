import { AiPharaphraseResult, LengthStrategy, ToneType } from "./paraphrase";

export interface ParaphraseContext {
  projectId: string;
  sectionId: string;
  originalText: string;
  tone?: ToneType;
  preservedWords?: string[];
  lengthStrategy?: LengthStrategy;
  promptTemplate: string;
}

export interface ParaphraseExecutionResult {
  result: AiPharaphraseResult;
  rawResponse: Record<string, unknown>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface SectionParaphrase {
  paraphraseSection(
    content: ParaphraseContext,
  ): Promise<ParaphraseExecutionResult>;
}
