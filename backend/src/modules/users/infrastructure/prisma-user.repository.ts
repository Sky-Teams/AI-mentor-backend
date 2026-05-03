import { PrismaClient } from "@prisma/client";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";
import { User, UserRepository } from "../domain/user";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getUserById(userId: string): Promise<User> {
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
}