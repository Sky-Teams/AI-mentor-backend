import { PrismaClient, type Prisma } from "@prisma/client";
import type {
  AuthRepository,
  StoredRefreshToken,
} from "../domain/auth.repository";
import type { User, UserWithPassword } from "../../users/domain/user";
import crypto from "crypto";
import { hashToken, sendEmail } from "src/shared/utils/send-email";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";

const mapUser = (user: {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string;
}): UserWithPassword => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  isActive: user.isActive,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  passwordHash: user.passwordHash ?? "",
});

export class PrismaAuthRepository implements AuthRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findUserByEmail(
    email: string,
  ): Promise<UserWithPassword | null> {
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
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async createUser(input: {
    email: string;
    fullName: string;
    passwordHash: string;
  }): Promise<{ message: string }> {
    const token = crypto.randomBytes(32).toString("hex");

    const frontendURL = process.env.FRONTEND_URL;

    if (!frontendURL)
      throw new AppError(
        "Missing environment variable: FRONTEND_URL",
        StatusCodes.INTERNAL_SERVER_ERROR,
        "FRONTEND_URL_NOT_FOUND",
      );

    const result = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const hashedToken = hashToken(token);
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 Min

        const user = await transaction.user.create({
          data: {
            email: input.email,
            fullName: input.fullName,
            passwordHash: input.passwordHash,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: expires,
          },
        });

        await transaction.creditWallet.create({
          data: {
            userId: user.id,
            balance: 0,
          },
        });
        return user;
      },
    );

    const verifyUrl = `${frontendURL}/verify-email/${token}`;
    try {
      await sendEmail(
        result.email,
        result.fullName,
        "Verify your email",
        verifyUrl,
      );
    } catch (error) {
      console.log("Failed to send email", result.email);
    }

    return {
      message:
        "Registration Successful! Please check your email to activate your account.",
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

  public async findRefreshToken(
    tokenHash: string,
  ): Promise<StoredRefreshToken | null> {
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

  public async verifyEmail(token: string): Promise<User> {
    let user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: hashToken(token),
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user)
      throw new AppError(
        "Invalid or expired token",
        StatusCodes.BAD_REQUEST,
        "INVALID_EMAIL_VERIFICATION_TOKEN",
      );

    user = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationExpires: null,
        emailVerificationToken: null,
      },
    });
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async forgotPassword(email: string): Promise<{ message: string }> {
    const frontendURL = process.env.FRONTEND_URL;

    if (!frontendURL)
      throw new AppError(
        "Missing environment variable: FRONTEND_URL",
        StatusCodes.INTERNAL_SERVER_ERROR,
        "FRONTEND_URL_NOT_FOUND",
      );

    const existing = await this.findUserByEmail(email);

    if (!existing)
      throw new AppError(
        "User was not found",
        StatusCodes.NOT_FOUND,
        "USER_NOT_FOUND",
      );

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 Min

    await this.prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordResetToken: hashToken(resetToken),
        passwordResetExpires: expires,
      },
    });

    const resetUrl = `${frontendURL}/reset-password/${resetToken}`;
    try {
      await sendEmail(
        existing.email,
        existing.fullName,
        "Reset your password",
        resetUrl,
      );
    } catch (error) {
      console.log("Failed to send email", existing.email);
    }

    return {
      message: "Please check your email to reset your password.",
    };
  }
}
