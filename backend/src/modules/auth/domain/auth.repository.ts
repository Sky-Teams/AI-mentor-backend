import type { User, UserWithPassword } from "../../users/domain/user";

export interface StoredRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<UserWithPassword | null>;
  findUserById(userId: string): Promise<User | null>;
  createUser(input: {
    email: string;
    fullName: string;
    passwordHash: string;
  }): Promise<{ message: string }>;
  storeRefreshToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  verifyEmail(token: string): Promise<User>;
  resendVerifyEmail(email: string): Promise<{ message: string }>;
}
