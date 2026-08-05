import {
  JournalSearchResult,
  OpenAlexJournalResponse,
} from "src/modules/journal/domain/journal.repository.js";

export class JournalSearchRepository {
  private readonly openAlexUrl = "https://api.openalex.org";

  public async findJournalByName(
    journalName: string,
  ): Promise<JournalSearchResult[]> {
    return this.searchOpenAlex(journalName);
  }

  private async searchOpenAlex(query: string): Promise<JournalSearchResult[]> {
    try {
      const res = await fetch(
        `${this.openAlexUrl}/sources?search=${encodeURIComponent(query)}&per-page=10`,
        {
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!res.ok) return [];

      const data = (await res.json()) as OpenAlexJournalResponse;

      return data.results
        .filter((item) => item.homepage_url !== null)
        .map((item) => ({
          id: crypto.randomUUID(),
          title: item.display_name ?? "",
          publisher: item.publisher ?? "",
          url: item.homepage_url ?? "",
          issn: item.issn_l ?? null,
        }));
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}
