import { PrismaClient } from "@prisma/client";
import { JournalRepository } from "src/modules/journal/domain/journal.repository.js";

export class PrismaJournalRepository implements JournalRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findAll(): Promise<Array<{ id: string; name: string }>> {
    return this.prisma.journal.findMany({
      select: { id: true, name: true },
    });
  }
}
