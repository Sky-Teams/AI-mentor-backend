import { Authors, JournalSearchResponse } from "../../domain/reference";

const mapOpenAlexAuthors = (item: any): Authors => ({
  firstName: item.author.display_name.split(" ")[0],
  lastName: item.author.display_name.split(" ").slice(1).join(" "),
});

export const mapOpenAlexRespones = (items: any): JournalSearchResponse => {
  const datePublished = items?.publication_date ? items.publication_date : null;
  return {
    id: crypto.randomUUID(),
    publisher: items?.primary_location?.source?.publisher || null,
    issue: items?.biblio?.issue || null,
    page: items?.biblio?.first_page
      ? `${items.biblio.first_page}-${items.biblio?.last_page || ""}`
      : null,
    title: items?.title || null,
    volume: items?.biblio?.volume || null,
    doi: items?.doi || null,
    authors: Array.isArray(items?.authorships)
      ? items.authorships.map(mapOpenAlexAuthors)
      : [],
    journalName: items?.primary_location?.source?.display_name || null,
    datePublished,
  };
};

export interface OpenAlexTitleResponse {
  items: Parameters<typeof mapOpenAlexRespones>[0][];
}

export interface OpenAlexDoiResponse {
  item: Parameters<typeof mapOpenAlexRespones>[0];
}
