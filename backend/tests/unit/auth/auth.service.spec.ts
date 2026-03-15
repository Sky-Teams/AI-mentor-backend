import { describe, expect, it, jest } from "@jest/globals";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../src/shared/errors/app-error";
import { AuthService } from "../../../src/modules/auth/application/auth.service";
import type { AuthRepository } from "../../../src/modules/auth/domain/auth.repository";
import type { PasswordHasher } from "../../../src/modules/auth/domain/password-hasher";
import type { TokenService } from "../../../src/modules/auth/domain/token-service";

const buildAuthService = () => {
  const authRepository: jest.Mocked<AuthRepository> = {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    storeRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };

  const passwordHasher: jest.Mocked<PasswordHasher> = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  const tokenService: jest.Mocked<TokenService> = {
    issueTokens: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    getRefreshTokenExpiryDate: jest.fn(),
  };

  return {
    authService: new AuthService(authRepository, passwordHasher, tokenService),
    authRepository,
    passwordHasher,
    tokenService,
  };
};

describe("AuthService", () => {
  it("registers a new user and stores a hashed refresh token", async () => {
    const { authService, authRepository, passwordHasher, tokenService } = buildAuthService();
    authRepository.findUserByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue("hashed-password");
    authRepository.createUser.mockResolvedValue({
      id: "user-1",
      email: "demo@example.com",
      fullName: "Demo User",
      role: "USER",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tokenService.issueTokens.mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    tokenService.getRefreshTokenExpiryDate.mockReturnValue(new Date("2026-04-01T00:00:00.000Z"));

    const result = await authService.register({
      email: "demo@example.com",
      fullName: "Demo User",
      password: "StrongPass123!",
    });

    expect(result.user.email).toBe("demo@example.com");
    expect(authRepository.storeRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: expect.not.stringContaining("refresh"),
      }),
    );
  });

  it("rejects invalid credentials during login", async () => {
    const { authService, authRepository, passwordHasher } = buildAuthService();
    authRepository.findUserByEmail.mockResolvedValue({
      id: "user-1",
      email: "demo@example.com",
      fullName: "Demo User",
      role: "USER",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: "stored-hash",
    });
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      authService.login({
        email: "demo@example.com",
        password: "wrong-password",
      }),
    ).rejects.toMatchObject({
      message: "Invalid email or password.",
      statusCode: StatusCodes.UNAUTHORIZED,
      code: "INVALID_CREDENTIALS",
    } satisfies Partial<AppError>);
  });
});
