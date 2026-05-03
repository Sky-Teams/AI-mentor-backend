import { LengthStrategy, ParaphraseRun, ToneType } from "./paraphrase";

export interface ParaphraseCompletionInput {
  paraphraseRunId: string;
  paraphrasedText: string;
  changes: Array<{
    originalPhrase: string;
    replacedWith: string;
    reason: string;
    startIndex?: number;
    endIndex?: number;
  }>;
  metrics: Array<{
    name: string;
    score: number;
    label: string;
    retionale?: string;
  }>;
  grammarTips: Array<{
    ruleName: string;
    explanation: string;
    example?: string;
  }>;
  rawResponse: Record<string, unknown>;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  appCreditsConsumed: number;
}

export interface ParaphraseRepository {
  createQueuedParaphrase(input: {
    projectId: string;
    sectionId: string;
    initiatedById: string;
    originalText: string;
    tone?: ToneType;
    preservedWords?: string[];
    lengthStrategy?: LengthStrategy;
    aiModel: string;
    promptTemplateId?: string;
  }): Promise<ParaphraseRun>;
  markParaphraseProcessing(paraphraseRunId: string): Promise<void>;
  markParaphraseFailed(
    paraphraseRunId: string,
    errorMessage: string,
  ): Promise<void>;
  completeParaphrase(input: ParaphraseCompletionInput): Promise<ParaphraseRun>;
  listSectionParaphrase(
    projectId: string,
    sectionId: string,
    ownerId: string,
  ): Promise<ParaphraseRun[]>;
  findParaphraseRun(
    paraphraseRunId: string,
    ownerId: string,
  ): Promise<ParaphraseRun | null>;
  deleteParaphraseRun(paraphraseRunId: string, ownerId: string): Promise<void>;
  getActiveParaphrasePrompt(): Promise<{
    id: string;
    templateText: string;
  } | null>;
}
