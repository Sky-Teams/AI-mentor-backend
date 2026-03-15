import { PrismaClient } from "@prisma/client";
import type { AuthRepository, StoredRefreshToken } from "../domain/auth.repository";
import type { User, UserWithPassword } from "../../users/domain/user";

const mapUser = (
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "USER" | "ADMIN";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    passwordHash?: string;
  },
): UserWithPassword => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  passwordHash: user.passwordHash ?? "",
});

export class PrismaAuthRepository implements AuthRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    return user ? mapUser(user) : null;
  }

  public async findUserById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async createUser(input: {
    email: string;
    fullName: string;
    passwordHash: string;
  }): Promise<User> {
    const result = await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          email: input.email,
          fullName: input.fullName,
          passwordHash: input.passwordHash,
        },
      });

      await transaction.creditWallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });

      return user;
    });

    return {
      id: result.id,
      email: result.email,
      fullName: result.fullName,
      role: result.role,
      isActive: result.isActive,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  public async storeRefreshToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.refreshToken.create({
      data: input,
    });
  }

  public async findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null> {
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
      },
    });

    return token;
  }

  public async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
