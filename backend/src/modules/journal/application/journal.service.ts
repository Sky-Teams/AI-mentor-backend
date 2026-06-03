import { JournalRepository } from "src/modules/journal/domain/journal.repository.js";
import { JournalDefinition } from "src/shared/seed-data/journals.js";

export class JournalService {
  public constructor(private readonly journalRepository: JournalRepository) {}

  public async getAllJournals() {
    return this.journalRepository.findAll();
  }

  public async getJournalById(journalId: string) {
    return this.journalRepository.findById(journalId);
  }

  public async createJournal(journal: JournalDefinition) {
    return this.journalRepository.createJournal(journal);
  }
}
