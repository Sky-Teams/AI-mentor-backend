import { JournalSearchResponse } from "../domain/reference";
import { JournalRepository } from "../domain/reference.repository";
import {
  CrossrefDoiResponse,
  CrossrefTitleResponse,
  mapCrossrefResponse,
} from "./mapper/crossref.mapper";
import {
  mapOpenAlexRespones,
  OpenAlexDoiResponse,
  OpenAlexTitleResponse,
} from "./mapper/openalex.mapper";

export class JournalExternalApiRepository implements JournalRepository {
  private readonly crossrefUrl: string = "https://api.crossref.org";
  private readonly openAlexUrl: string = "https://api.openalex.org";

  public async findByDoi(doi: string): Promise<JournalSearchResponse | null> {
    let response = await fetch(
      `${this.crossrefUrl}/works/${encodeURIComponent(doi)}`,
      { headers: { Accept: "application/json" } },
    );

    let data;

    if (response.ok) {
      data = (await response.json()) as CrossrefDoiResponse;
      return mapCrossrefResponse(data.message);
    }

    response = await fetch(
      `${this.openAlexUrl}/works/https://doi.org/${encodeURIComponent(doi)}`,
      { headers: { Accept: "application/json" } },
    );
    if (response.ok) {
      data = (await response.json()) as OpenAlexDoiResponse;
      return mapOpenAlexRespones(data);
    }

    return null;
  }

  public async findByTitle(
    title: string,
  ): Promise<JournalSearchResponse[] | []> {
    let response = await fetch(
      `${this.crossrefUrl}/works?query.title=${encodeURIComponent(title)}`,
      { headers: { Accept: "application/json" } },
    );

    let data;

    if (response.ok) {
      data = (await response.json()) as CrossrefTitleResponse;
      return data.message.items.map((item) => mapCrossrefResponse(item));
    }

    response = await fetch(
      `${this.openAlexUrl}/works?filter=title.search:${encodeURIComponent(title)}`,
      { headers: { Accept: "application/json" } },
    );
    if (response.ok) {
      data = (await response.json()) as OpenAlexTitleResponse;
      return data.items.map((item) => mapOpenAlexRespones(item));
    }

    return [];
  }
}
