import { JournalRepository } from "src/modules/journal/domain/journal.repository.js";
import { CreateJournalInput } from "src/shared/seed-data/journals.js";
import { OpenAiJournalGenerator } from "src/modules/journal/infrastructure/openai-journal-generator";

export class JournalService {
  public constructor(
    private readonly journalRepository: JournalRepository,
    private readonly journalGenerator: OpenAiJournalGenerator = new OpenAiJournalGenerator(),
  ) {}

  public async getAllJournals(specialtyId: string) {
    return this.journalRepository.findAll(specialtyId);
  }

  public async getJournalById(journalId: string) {
    return this.journalRepository.findById(journalId);
  }

  public async createJournal(journal: CreateJournalInput) {
    return this.journalRepository.createJournal(journal);
  }

  public async generateJournalFromName(input: { journalName: string }) {
    return this.journalGenerator.generateJournalTemplate({
      journalName: input.journalName,
    });
  }
}
