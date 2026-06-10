import { JournalSearchResponse } from "../domain/reference";
import { JournalRepository } from "../domain/reference.repository";
import {
  CrossRefDoiResponse,
  CrossRefTitleResponse,
  mapCrossRefResponse,
} from "./mapper/crossref.mapper";
import {
  mapOpenAlexResponse,
  OpenAlexDoiResponse,
  OpenAlexTitleResponse,
} from "./mapper/openalex.mapper";

export class JournalExternalApiRepository implements JournalRepository {
  private readonly crossRefUrl: string = "https://api.crossref.org";
  private readonly openAlexUrl: string = "https://api.openalex.org";

  public async findByDoi(doi: string): Promise<JournalSearchResponse | null> {
    let response = await fetch(
      `${this.crossRefUrl}/works/${encodeURIComponent(doi)}`,
      { headers: { Accept: "application/json" } },
    );

    let data;

    if (response.ok) {
      data = (await response.json()) as CrossRefDoiResponse;
      return mapCrossRefResponse(data.message);
    }

    response = await fetch(
      `${this.openAlexUrl}/works/https://doi.org/${encodeURIComponent(doi)}`,
      { headers: { Accept: "application/json" } },
    );
    if (response.ok) {
      data = (await response.json()) as OpenAlexDoiResponse;
      return mapOpenAlexResponse(data);
    }

    return null;
  }

  public async findByTitle(
    title: string,
  ): Promise<JournalSearchResponse[] | []> {
    let response = await fetch(
      `${this.crossRefUrl}/works?query.title=${encodeURIComponent(title)}`,
      { headers: { Accept: "application/json" } },
    );

    let data;

    if (response.ok) {
      data = (await response.json()) as CrossRefTitleResponse;
      return data.message.items.map((item) => mapCrossRefResponse(item));
    }

    response = await fetch(
      `${this.openAlexUrl}/works?filter=title.search:${encodeURIComponent(title)}`,
      { headers: { Accept: "application/json" } },
    );
    if (response.ok) {
      data = (await response.json()) as OpenAlexTitleResponse;
      return data.items.map((item) => mapOpenAlexResponse(item));
    }

    return [];
  }
}
