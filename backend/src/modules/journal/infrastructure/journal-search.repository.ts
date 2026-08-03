import {
  CrossRefJournalResponse,
  JournalSearchResult,
} from "src/modules/journal/domain/journal.repository.js";

export class JournalSearchRepository {
  private readonly crossRefUrl: string = "https://api.crossref.org";

  public async findJournalByName(
    journalName: string,
  ): Promise<JournalSearchResult> {
    const response = await fetch(
      `${this.crossRefUrl}/journals?query=${encodeURIComponent(journalName)}&rows=10`,
      {
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) return [];

    const data = (await response.json()) as CrossRefJournalResponse;

    return data.message.items.map((item) => ({
      id: crypto.randomUUID(),
      title: item.title || "",
      publisher: item.publisher || "",
      url: item.url || "",
      issn: item.ISSN[0] || null,
    }));
  }
}
