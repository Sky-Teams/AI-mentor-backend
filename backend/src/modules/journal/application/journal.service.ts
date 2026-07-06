import {
  CreateJournalInput,
  JournalRepository,
  UpdateJournalInput,
} from "src/modules/journal/domain/journal.repository.js";

export class JournalService {
  public constructor(private readonly journalRepository: JournalRepository) {}

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
}
