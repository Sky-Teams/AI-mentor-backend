import { Prisma, PrismaClient } from "@prisma/client";
import { CitationRepository } from "../domain/citation.repository";
import {
  Authors,
  BaseCitationOutPut,
  Citation,
  CitationFormatType,
  CitationOutput,
  CitationType,
} from "../domain/citation";
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
  page: string | null;
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
  type: "WEBSITE",
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
  page: string | null;
  doi: string | null;
  issueNumber: number | null;
  createdAt: Date;
}): BaseCitationOutPut => ({
  id: input.id,
  citationId: input.citationId,
  type: "JOURNAL",
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
  type: "REPORT",
  title: input.title,
  authors: input.authors as Authors[],
});

export class PrismaCitationRepository implements CitationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createCitation(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
    style: CitationFormatType;
  }): Promise<void> {
    await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const citation = await transaction.citation.create({
          data: {
            type: input.citation.type,
            userId: input.ownerId,
            projectId: input.projectId,
            style: input.style,
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

  public async updateCitation(input: {
    id: string;
    citation: Citation;
    style?: CitationFormatType;
  }): Promise<CitationOutput> {
    return await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const citation = await transaction.citation.update({
          where: {
            id: input.id,
          },
          data: {
            type: input.citation.type,
            style: input.style,
          },
        });
        await this.updateCitationType({
          citation: input.citation,
          citationId: citation.id,
          tx: transaction,
        });
        
        const completeCitation = await transaction.citation.findFirstOrThrow({
          where: { id: input.id },
          include: {
            bookCitation: true,
            journalCitation: true,
            reportCitation: true,
            websiteCitation: true,
          },
        });
        return completeCitation as any;
      },
    );
  }

  private async updateCitationType(input: {
    citation: Citation;
    citationId: string;
    tx: Prisma.TransactionClient;
  }): Promise<BaseCitationOutPut> {
    let result;
    switch (input.citation.type) {
      case "BOOK":
        result = await input.tx.bookCitation.update({
          where: { citationId: input.citationId },
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
        result = await input.tx.websiteCitation.update({
          where: { citationId: input.citationId },
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
        result = await input.tx.journalCitation.update({
          where: { citationId: input.citationId },
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
        result = await input.tx.reportCitation.update({
          where: { citationId: input.citationId },
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

  public async GetCitationType(input: CitationOutput): Promise<{
    citation: Citation;
    type: CitationType;
    style: CitationFormatType;
  }> {
    switch (input.type) {
      case "BOOK":
        return {
          citation: input.bookCitation,
          type: input.type,
          style: input.style,
        };
      case "JOURNAL":
        return {
          citation: input.journalCitation,
          type: input.type,
          style: input.style,
        };
      case "REPORT":
        return {
          citation: input.reportCitation,
          type: input.type,
          style: input.style,
        };
      case "WEBSITE":
        return {
          citation: input.websiteCitation,
          type: input.type,
          style: input.style,
        };
      default:
        throw new AppError(
          "Unsupported type",
          404,
          "UNSUPPORTED_CITATION_TYPE",
        );
    }
  }

  public async GetCitationById(
    citationId: string,
    ownerId: string,
  ): Promise<CitationOutput | null> {
    const citation = await this.prisma.citation.findFirst({
      where: { id: citationId, userId: ownerId },
      include: {
        bookCitation: true,
        journalCitation: true,
        reportCitation: true,
        websiteCitation: true,
      },
    });
    if (!citation) return null;

    return citation as any;
  }
}
