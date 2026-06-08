import {
  CreateJournalInput,
  JournalDefinition,
} from "src/shared/seed-data/journals.js";

// This CreateJournal type also includes JournalDefinition type, and Omit means to dont use that guidelinePack from JournalDefinition
export type CreatedJournal = Omit<
  JournalDefinition,
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

export interface Specialty {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface JournalRepository {
  findAll(): Promise<Array<{ id: string; name: string }>>;
  findById(id: string): Promise<{ id: string; name: string } | null>;
  createJournal(input: CreateJournalInput): Promise<CreatedJournal>;
  getAllSpecialties(): Promise<Specialty[]>;
}
