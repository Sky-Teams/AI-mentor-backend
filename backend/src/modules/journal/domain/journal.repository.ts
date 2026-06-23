// Create journal interface
export interface SectionChecklistsGroup {
  title: string | null;
  items: string[];
}

export interface JournalSectionDefinition {
  title: string;
  sectionOrder: number;
  isOptional: boolean;
  description?: string;
  maxChars: number;
  checklists: SectionChecklistsGroup[];
  subsections?: JournalSectionDefinition[];
}

export interface CreateJournalInput {
  name: string;
  publisher: string;
  description?: string;
  isDefault?: boolean;
  sections: JournalSectionDefinition[];
  guidelinePack: string;
  specialtyId: string;
}

// Update journal interface
export interface UpdateSectionChecklistsGroup {
  title?: string;
  items?: string[];
}

export interface UpdateJournalSectionDefinition {
  id?: string;
  title?: string;
  sectionOrder?: number;
  isOptional?: boolean;
  description?: string;
  maxChars?: number;
  checklists?: UpdateSectionChecklistsGroup[];
  subsections?: UpdateJournalSectionDefinition[];
}

export interface UpdateJournalInput {
  name?: string;
  publisher?: string;
  description?: string;
  isDefault?: boolean;
  sections?: UpdateJournalSectionDefinition[];
  guidelinePack?: string;
  specialtyId?: string;
}

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
  updateJournal(id: string, input: UpdateJournalInput): Promise<CreatedJournal>;
}
