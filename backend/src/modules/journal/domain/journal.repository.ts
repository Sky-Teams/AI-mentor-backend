import { CreateJournalInput } from "src/shared/seed-data/journals.js";

// This CreateJournal type also includes CreateJournalInput type, and Omit means to dont use that guidelinePack from CreateJournalInput
export type CreatedJournal = Omit<
  CreateJournalInput,
  "guidelinePack" | "specialtyId"
> & {
  id: string;
  guidelinePack: {
    id: string;
    rules: unknown;
  };
  specialty: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  sections: Array<
    CreateJournalInput["sections"][number] & {
      id: string;
      key: string;
      journalId: string;
      createdAt: Date;
      updatedAt: Date;
      checklists: Array<
        CreateJournalInput["sections"][number]["checklists"][number] & {
          id: string;
          createdAt: Date;
          updatedAt: Date;
        }
      >;
      subsections?: Array<
        CreateJournalInput["sections"][number] & {
          id: string;
          key: string;
          journalId?: string;
          createdAt: Date;
          updatedAt: Date;
          checklists: Array<
            CreateJournalInput["sections"][number]["checklists"][number] & {
              id: string;
              createdAt: Date;
              updatedAt: Date;
            }
          >;
        }
      >;
    }
  >;
};

export interface JournalRepository {
  findAll(specialtyId: string): Promise<Array<{ id: string; name: string }>>;
  findById(id: string): Promise<{ id: string; name: string } | null>;
  createJournal(input: CreateJournalInput): Promise<CreatedJournal>;
}
