import { Journal } from "@prisma/client";

export interface JournalRepository {
  findAll(): Promise<Array<{ id: string; name: string }>>;
  // findById(id: string): Promise<{ id: string; name: string }>;
}
