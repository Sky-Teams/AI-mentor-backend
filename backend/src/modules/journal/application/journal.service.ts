import {
  CreateJournalInput,
  JournalRepository,
  UpdateJournalInput,
} from "src/modules/journal/domain/journal.repository.js";
import { JournalSearchRepository } from "src/modules/journal/infrastructure/journal-search.repository.js";
import { OpenAiJournalGenerator } from "src/modules/journal/infrastructure/openai-journal-generator";

export class JournalService {
  public constructor(
    private readonly journalRepository: JournalRepository,
    private readonly journalSearchRepository: JournalSearchRepository,
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
  public async updateJournal(journalId: string, journal: UpdateJournalInput) {
    return this.journalRepository.updateJournal(journalId, journal);
  }

  public async updateJournalSectionsOrder(
    journalId: string,
    sectionIds: Array<{ sectionId: string; subsectionIds?: string[] }>,
  ) {
    return this.journalRepository.updateJournalSectionsOrder(
      journalId,
      sectionIds,
    );
  }

  public async extractJournalFromSource(input: {
    journalName: string;
    publisher?: string;
    url: string;
    issn?: string | null;
  }) {
    return this.journalGenerator.generateJournalTemplate(input);
  }

  public async findJournalByName(name: string) {
    return this.journalSearchRepository.findJournalByName(name);
  }
}
