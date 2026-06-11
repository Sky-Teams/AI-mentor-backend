import crypto from "crypto";
import {
  Authors,
  JournalSearchResponse,
} from "src/modules/references/domain/reference";

const mapAuthors = (items: { given: string; family: string }): Authors => ({
  firstName: items.given,
  lastName: items.family,
});

const mapDatePublished = (item: {
  "date-parts"?: Array<[number, number, number]>;
}) => {
  const [[year, month, day] = []] = item["date-parts"] || [[]];
  const datePartsArray = [year, month, day].filter(Boolean);
  const datePublished =
    datePartsArray.length > 0 ? datePartsArray.join("-") : null;
  return datePublished;
};

export const mapCrossRefResponse = (items: {
  publisher?: string;
  URL: string;
  issue?: string;
  page?: string;
  author?: Parameters<typeof mapAuthors>[0][] | [];
  title?: string[];
  volume?: string;
  "container-title"?: string[];
  published?: Parameters<typeof mapDatePublished>[0];
}): JournalSearchResponse => {
  return {
    id: crypto.randomUUID(),
    publisher: items?.publisher || null,
    doi: items?.URL,
    issue: items?.issue || null,
    page: items?.page || null,
    title: items?.title?.[0] || null,
    volume: items?.volume || null,
    authors: items?.author ? items.author.map(mapAuthors) : [],
    journalName: items["container-title"]
      ? items["container-title"]?.[0]
      : null,
    datePublished: items?.published ? mapDatePublished(items.published) : null,
  };
};

export interface CrossRefTitleResponse {
  message: {
    items: Parameters<typeof mapCrossRefResponse>[0][];
  };
}
export interface CrossRefDoiResponse {
  message: Parameters<typeof mapCrossRefResponse>[0];
}
