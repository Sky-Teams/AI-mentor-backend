import { PrismaClient } from "@prisma/client";
import { Role, User, UserRepository, UserWithPassword } from "../domain/user";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";

const mapUser = (user: {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}): User => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  isActive: user.isActive,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  role: user.role,
});

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getUserById(userId: string): Promise<UserWithPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(
        "User was not found",
        StatusCodes.NOT_FOUND,
        `USER_NOT_FOUND`,
      );
    }

    return user;
  }

  public async changePassword(
    userId: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPassword,
      },
    });

    return {
      message: "Password changed successfully",
    };
  }

  public async updateProfile(userId: string, fullName: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName,
      },
    });

    return mapUser(user);
  }
}
