import { Journal } from "@prisma/client";
import {
  CreateJournalInput,
  JournalDefinition,
} from "src/shared/seed-data/journals.js";

export type CreatedJournal = JournalDefinition & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sections: Array<
    JournalDefinition["sections"][number] & {
      id: string;
      journalId: string;
      createdAt: Date;
      updatedAt: Date;
      checklist: Array<
        JournalDefinition["sections"][number]["checklist"][number] & {
          id: string;
          journalSectionTemplateId: string;
          createdAt: Date;
          updatedAt: Date;
        }
      >;
    }
  >;
};

export interface JournalRepository {
  findAll(): Promise<Array<{ id: string; name: string }>>;
  findById(id: string): Promise<{ id: string; name: string } | null>;
  createJournal(input: CreateJournalInput): Promise<Journal>;
}
