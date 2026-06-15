import { JournalExternalApiRepository } from "../infrastructure/journal.external-api.repository";

export class JournalReferenceService {
  public constructor(
    private readonly journalExternalApiRepository: JournalExternalApiRepository,
  ) {}

  public async searchJournals(input: { doi?: string; title?: string }) {
    if (input.doi && this.isDoi(input.doi)) {
      return await this.findByDoi(input.doi);
    }

    return await this.findByTitle(input.title as string);
  }

  private async findByDoi(doi: string) {
    return await this.journalExternalApiRepository.findByDoi(doi);
  }

  private async findByTitle(title: string) {
    return await this.journalExternalApiRepository.findByTitle(title);
  }

  private isDoi(value: string): boolean {
    return /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i.test(value);
  }
}
