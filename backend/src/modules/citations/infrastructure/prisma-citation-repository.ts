import { Prisma, PrismaClient } from "@prisma/client";
import { CitationRepository } from "../domain/citation.repository";
import { Authors, BaseCitationOutPut, Citation } from "../domain/citation";
import { AppError } from "src/shared/errors/app-error";

const mapBookCitation = (input: {
  id: string;
  citationId: string;
  title: string;
  authors: unknown;
  datePublished?: Date | null;
  publisher: string;
  placePublished?: string | null;
  isbn?: string | null;
  edition: string | null;
  page: string;
  volumeNumber: number | null;
  createdAt: Date;
}): BaseCitationOutPut => ({
  id: input.id,
  citationId: input.citationId,
  type: "BOOK",
  title: input.title,
  authors: input.authors as Authors[],
});

const mapWebsiteCitation = (input: {
  id: string;
  citationId: string;
  title: string;
  authors: unknown;
  datePublished?: Date | null;
  websiteName: string;
  url: string;
  dateAccess: Date;
  createdAt: Date;
}): BaseCitationOutPut => ({
  id: input.id,
  citationId: input.citationId,
  type: "BOOK",
  title: input.title,
  authors: input.authors as Authors[],
});

const mapJournalCitation = (input: {
  id: string;
  citationId: string;
  title: string;
  authors: unknown;
  datePublished?: Date | null;
  journalName: string;
  volumeNumber: number | null;
  page: string;
  doi: string | null;
  issueNumber: number | null;
  createdAt: Date;
}): BaseCitationOutPut => ({
  id: input.id,
  citationId: input.citationId,
  type: "BOOK",
  title: input.title,
  authors: input.authors as Authors[],
});

const mapReportCitation = (input: {
  id: string;
  citationId: string;
  title: string;
  authors: unknown;
  datePublished?: Date | null;
  publisher: string | null;
  url: string | null;
  createdAt: Date;
}): BaseCitationOutPut => ({
  id: input.id,
  citationId: input.citationId,
  type: "BOOK",
  title: input.title,
  authors: input.authors as Authors[],
});

export class PrismaCitationRepository implements CitationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createCitaiotn(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
  }): Promise<void> {
    await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const citation = await transaction.citation.create({
          data: {
            type: input.citation.type,
            userId: input.ownerId,
            projectId: input.projectId,
          },
        });
        await this.createCitationType({
          citation: input.citation,
          citationId: citation.id,
          tx: transaction,
        });
      },
    );
  }

  private async createCitationType(input: {
    citation: Citation;
    citationId: string;
    tx: Prisma.TransactionClient;
  }): Promise<BaseCitationOutPut> {
    let result;
    switch (input.citation.type) {
      case "BOOK":
        result = await input.tx.bookCitation.create({
          data: {
            citationId: input.citationId,
            title: input.citation.title,
            authors: input.citation.authors,
            datePublished: input.citation.datePublished
              ? new Date(input.citation.datePublished).toISOString()
              : null,
            publisher: input.citation.publisher,
            placePublished: input.citation.placePublished,
            isbn: input.citation.isbn,
            page: input.citation.page,
            volumeNumber: input.citation.volumeNumber,
            edition: input.citation.edition,
          },
        });
        return mapBookCitation(result);
      case "WEBSITE":
        result = await input.tx.websiteCitation.create({
          data: {
            citationId: input.citationId,
            title: input.citation.title,
            authors: input.citation.authors,
            websiteName: input.citation.websiteName,
            datePublished: input.citation.datePublished
              ? new Date(input.citation.datePublished).toISOString()
              : null,
            url: input.citation.url,
            dateAccess: new Date(input.citation.dateAccess).toISOString(),
          },
        });
        return mapWebsiteCitation(result);
      case "JOURNAL":
        result = await input.tx.journalCitation.create({
          data: {
            citationId: input.citationId,
            title: input.citation.title,
            authors: input.citation.authors,
            journalName: input.citation.journalName,
            volumeNumber: input.citation.volumeNumber,
            page: input.citation.page,
            datePublished: input.citation.datePublished
              ? new Date(input.citation.datePublished).toISOString()
              : null,
            doi: input.citation.doi,
            issueNumber: input.citation.issueNumber,
          },
        });
        return mapJournalCitation(result);
      case "REPORT":
        result = await input.tx.reportCitation.create({
          data: {
            citationId: input.citationId,
            title: input.citation.title,
            authors: input.citation.authors,
            datePublished: input.citation.datePublished
              ? new Date(input.citation.datePublished).toISOString()
              : null,
            publisher: input.citation.publisher,
            url: input.citation.url,
          },
        });
        return mapReportCitation(result);
      default:
        throw new AppError(
          "Unsupported type",
          404,
          "UNSUPPORTED_CITATION_TYPE",
        );
    }
  }
}
