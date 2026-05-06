import { JournalRepository } from "src/modules/journal/domain/journal.repository.js";

export class JournalService {
  public constructor(private readonly journalRepository: JournalRepository) {}

  public async listJournals() {
    return this.journalRepository.findAll();
  }
}
