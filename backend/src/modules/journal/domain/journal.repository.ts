import {
  CreateJournalInput,
  JournalDefinition,
} from "src/shared/seed-data/journals.js";

export type CreatedJournal = Omit<JournalDefinition, "guidelinePack"> & {
  id: string;
  guidelinePackId: string;
  guidelinePack: {
    id: string;
    name: string;
    version: string;
    status: string;
    rules: unknown;
  };
  createdAt: Date;
  updatedAt: Date;
  sections: Array<
    JournalDefinition["sections"][number] & {
      id: string;
      journalId: string;
      createdAt: Date;
      updatedAt: Date;
      checklists: Array<
        JournalDefinition["sections"][number]["checklists"][number] & {
          id: string;
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
  createJournal(input: CreateJournalInput): Promise<CreatedJournal>;
}
