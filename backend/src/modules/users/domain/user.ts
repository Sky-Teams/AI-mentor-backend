export const roles = ["USER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export interface UserRepository {
  getUserById(userId: string): Promise<User>;
}
