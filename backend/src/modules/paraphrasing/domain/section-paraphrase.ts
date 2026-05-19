import { Project } from "src/modules/projects/domain/project";
import { AiPharaphraseResult, LengthStrategy, ToneType } from "./paraphrase";

export interface ParaphraseContext {
  project: Project;
  sectionId: string;
  originalText: string;
  tone?: ToneType;
  preservedWords?: string[];
  lengthStrategy?: LengthStrategy;
  promptTemplate?: string;
  guidelineRules: Record<string, unknown>
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
