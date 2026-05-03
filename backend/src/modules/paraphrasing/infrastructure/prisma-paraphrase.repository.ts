import { PrismaClient } from "@prisma/client";
import {
  ParaphraseCompletionInput,
  ParaphraseRepository,
} from "../domain/paraphrase.repository";
import {
  GrammarTip,
  LengthStrategy,
  ParaphraseChange,
  ParaphraseMetric,
  ParaphraseRun,
  ToneType,
} from "../domain/paraphrase";

const mapParaphraseRun = (paraphrase: any): ParaphraseRun => {
  return {
    id: paraphrase.id,
    projectId: paraphrase.projectId,
    sectionId: paraphrase.sectionId,
    initiatedById: paraphrase.initiatedById,
    originalText: paraphrase.originalText,
    paraphrasedText: paraphrase.paraphrasedText,
    grammarTips: (paraphrase.grammarTips as GrammarTip[]) ?? [],
    tone: (paraphrase.tone as ToneType) ?? "NATURAL",
    changes: (paraphrase.changes as ParaphraseChange[]) ?? [],
    metrics: (paraphrase.metrics as ParaphraseMetric[]) ?? [],
    aiModel: paraphrase.aiModel,
    preservedWords: (paraphrase.preservedWords as string[]) ?? [],
    lengthStrategy: (paraphrase.lengthStrategy as LengthStrategy) ?? "SHORTEN",
    inputTokens: paraphrase.inputTokens,
    outputTokens: paraphrase.outputTokens,
    totalTokens: paraphrase.totalTokens,
    appCreditsConsumed: paraphrase.appCreditsConsumed,
    errorMessage: paraphrase.errorMessage,
    createdAt: paraphrase.createdAt,
    completedAt: paraphrase.completedAt,
  };
};

export class PrismaParaphraseRepository implements ParaphraseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createQueuedParaphrase(input: {
    projectId: string;
    sectionId: string;
    initiatedById: string;
    originalText: string;
    tone?: ToneType;
    preservedWords?: string[];
    lengthStrategy?: LengthStrategy;
    aiModel: string;
    promptTemplateId?: string;
  }): Promise<ParaphraseRun> {
    const paraphrase = await this.prisma.paraphraseRun.create({
      data: {
        projectId: input.projectId,
        sectionId: input.sectionId,
        initiatedById: input.initiatedById,
        tone: String(input.tone ?? "SIMPLE"),
        aiModel: input.aiModel,
        preservedWords: input.preservedWords,
        lengthStrategy: String(input.lengthStrategy ?? "SHORTEN"),
        status: "QUEUED",
        originalText: input.originalText,
        paraphrasedText: "",
        promptTemplateId: input.promptTemplateId,
      },
    });
    return mapParaphraseRun(paraphrase);
  }

  public async markParaphraseProcessing(
    paraphraseRunId: string,
  ): Promise<void> {
    await this.prisma.paraphraseRun.update({
      where: { id: paraphraseRunId },
      data: {
        status: "PROCESSING",
        startedAt: new Date(),
      },
    });
  }

  public async markParaphraseFailed(
    paraphraseRunId: string,
    errorMessage: string,
  ): Promise<void> {
    await this.prisma.paraphraseRun.update({
      where: { id: paraphraseRunId },
      data: {
        status: "FAILED",
        errorMessage,
        completedAt: new Date(),
      },
    });
  }

  public async completeParaphrase(
    input: ParaphraseCompletionInput,
  ): Promise<ParaphraseRun> {
    const paraphraseRun = await this.prisma.paraphraseRun.update({
      where: { id: input.paraphraseRunId },
      data: {
        status: "COMPLETED",
        paraphrasedText: input.paraphrasedText,
        changes: input.changes,
        metrics: input.metrics,
        grammarTips: input.grammarTips,
        rawResponse: input.rawResponse,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        totalTokens: input.totalTokens,
        appCreditsConsumed: input.appCreditsConsumed,
        completedAt: new Date(),
      },
    });
    return mapParaphraseRun(paraphraseRun);
  }

  public async listSectionParaphrase(
    projectId: string,
    sectionId: string,
    ownerId: string,
  ): Promise<ParaphraseRun[]> {
    const paraphrases = await this.prisma.paraphraseRun.findMany({
      where: {
        projectId,
        sectionId,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return paraphrases.map((item) => mapParaphraseRun(item));
  }

  public async findParaphraseRun(
    paraphraseRunId: string,
    ownerId: string,
  ): Promise<ParaphraseRun | null> {
    const paraphrase = await this.prisma.paraphraseRun.findFirst({
      where: {
        id: paraphraseRunId,
        initiatedById: ownerId,
      },
    });

    if (!paraphrase) return null;
    return mapParaphraseRun(paraphrase);
  }

  public async deleteParaphraseRun(
    paraphraseRunId: string,
    ownerId: string,
  ): Promise<void> {
    await this.prisma.paraphraseRun.deleteMany({
      where: {
        id: paraphraseRunId,
        initiatedById: ownerId,
      },
    });
  }

  public async getActiveParaphrasePrompt(): Promise<{
    id: string;
    templateText: string;
  } | null> {
    const template = await this.prisma.promptTemplate.findFirst({
      where: {
        code: "case_report_section_paraphrase",
        status: "ACTIVE",
      },
      orderBy: {
        version: "desc",
      },
    });
    return template
      ? {
          id: template.id,
          templateText: template.templateText,
        }
      : null;
  }
}
