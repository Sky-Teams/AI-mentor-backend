import {
  GrammarTip,
  LengthStrategy,
  ParaphraseChange,
  ParaphraseMetric,
  ParaphraseRun,
  ToneType,
} from "../domain/paraphrase";
import { ParaphraseRepository } from "../domain/paraphrase.repository";
import { SectionParaphrase } from "../domain/section-paraphrase";
import { ProjectService } from "src/modules/projects/application/project.service";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";
import { BillingService } from "src/modules/billing/application/billing.service";
import { env } from "src/shared/config/env";
import { PROMPT_TEMPLATE } from "src/shared/prompTemplate/openAiPromptTemplate";

export class ParaphraseService {
  public constructor(
    private readonly paraphraseRepository: ParaphraseRepository,
    private readonly projectService: ProjectService,
    private readonly billingService: BillingService,
    private readonly sectionParaphrase: SectionParaphrase,
  ) {}

  public async triggerSectionParaphrase(input: {
    projectId: string;
    sectionId: string;
    ownerId: string;
    tone: ToneType;
    preservedWords?: string[];
    lengthStrategy?: LengthStrategy;
  }): Promise<ParaphraseRun> {
    const project = await this.projectService.getProject(
      input.projectId,
      input.ownerId,
    );
    if (project.status === "ARCHIVED") {
      throw new AppError(
        "Archived projects cannot be reviewed.",
        StatusCodes.BAD_REQUEST,
        "PROJECT_ARCHIVED",
      );
    }

    const section = await this.projectService.getSectionById(
      input.sectionId,
      input.ownerId,
      input.projectId,
    );
    if (!section.content.trim()) {
      throw new AppError(
        "Section content is required before paraphrasing.",
        StatusCodes.BAD_REQUEST,
        "SECTION_EMPTY",
      );
    }

    const activePrompt =
      await this.paraphraseRepository.getActiveParaphrasePrompt();
    const promptTemplate = activePrompt?.templateText
      ? activePrompt.templateText
          .replace("{{tone}}", `${input.tone}`)
          .replace("{{content}}", section.content)
      : PROMPT_TEMPLATE.PARAPHRSE.replace("{{tone}}", `${input.tone}`).replace(
          "{{content}}",
          section.content,
        );

    await this.billingService.assertCanAfford(input.ownerId, "PARAPHRASE");

    const paraphraseRun =
      await this.paraphraseRepository.createQueuedParaphrase({
        projectId: input.projectId,
        sectionId: section.id,
        initiatedById: input.ownerId,
        originalText: section.content,
        tone: input.tone,
        preservedWords: input.preservedWords,
        lengthStrategy: input.lengthStrategy,
        aiModel: env.OPENAI_MODEL,
        promptTemplateId: activePrompt?.id,
      });

    await this.paraphraseRepository.markParaphraseProcessing(paraphraseRun.id);
    try {
      const execution = await this.sectionParaphrase.paraphraseSection({
        projectId: input.projectId,
        sectionId: section.id,
        originalText: section.content,
        tone: input.tone,
        preservedWords: input.preservedWords,
        lengthStrategy: input.lengthStrategy,
        promptTemplate: promptTemplate,
      });

      const billedCredits = await this.billingService.recordSuccess({
        userId: input.ownerId,
        paraphraseRunId: paraphraseRun.id,
        operation: "PARAPHRASE",
        projectId: input.projectId,
        model: env.OPENAI_MODEL,
        usage: execution.usage,
        amount: execution.usage.totalTokens,
      });

      const completeParaphrase =
        await this.paraphraseRepository.completeParaphrase({
          paraphraseRunId: paraphraseRun.id,
          paraphrasedText: execution.result.paraphrasedText,
          changes: execution.result.changes as ParaphraseChange[],
          metrics: execution.result.metrics as ParaphraseMetric[],
          grammarTips: execution.result.grammarTips as GrammarTip[],
          rawResponse: execution.rawResponse,
          inputTokens: execution.usage.inputTokens,
          outputTokens: execution.usage.outputTokens,
          totalTokens: execution.usage.totalTokens,
          appCreditsConsumed: billedCredits,
        });

      return completeParaphrase;
    } catch (error) {
      await this.billingService.recordFailed({
        userId: input.ownerId,
        projectId: input.projectId,
        paraphraseRunId: paraphraseRun.id,
        operation: "PARAPHRASE",
        model: env.OPENAI_MODEL,
      });

      const message =
        error instanceof Error
          ? error.message
          : "Paraphrase processing failed.";
      await this.paraphraseRepository.markParaphraseFailed(
        paraphraseRun.id,
        message,
      );
      throw error;
    }
  }

  public async listSectionParaphrase(
    projectId: string,
    sectionId: string,
    ownerId: string,
  ): Promise<ParaphraseRun[]> {
    await this.projectService.getProject(projectId, ownerId);
    await this.projectService.getSectionById(sectionId, ownerId, projectId);
    const paraphrase = await this.paraphraseRepository.listSectionParaphrase(
      projectId,
      sectionId,
      ownerId,
    );
    return paraphrase;
  }

  public async getParaphraseRun(
    paraphraseRunId: string,
    ownerId: string,
  ): Promise<ParaphraseRun> {
    const paraphrase = await this.paraphraseRepository.findParaphraseRun(
      paraphraseRunId,
      ownerId,
    );

    if (!paraphrase) {
      throw new AppError(
        "Paraphrase was not found",
        StatusCodes.NOT_FOUND,
        "PARAPHRASE_NOT_FOUND",
      );
    }
    return paraphrase;
  }

  public async deleteParaphraseRun(
    paraphraseRunId: string,
    ownerId: string,
  ): Promise<void> {
    const paraphrase = await this.paraphraseRepository.findParaphraseRun(
      paraphraseRunId,
      ownerId,
    );

    if (!paraphrase) {
      throw new AppError(
        "Paraphrase was not found",
        StatusCodes.NOT_FOUND,
        "PARAPHRASE_NOT_FOUND",
      );
    }

    return await this.paraphraseRepository.deleteParaphraseRun(
      paraphraseRunId,
      ownerId,
    );
  }
}
