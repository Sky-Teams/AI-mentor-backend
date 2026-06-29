import { StatusCodes } from "http-status-codes";
import { createHash } from "node:crypto";
import { AppError } from "../../../shared/errors/app-error";
import type { AuthRepository } from "../domain/auth.repository";
import type { PasswordHasher } from "../domain/password-hasher";
import type { TokenPair, TokenService } from "../domain/token-service";
import type { User } from "../../users/domain/user";

export interface RegisterUserInput {
  email: string;
  fullName: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

export class AuthService {
  public constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  public async register(input: RegisterUserInput) {
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new AppError(
        "Email is already registered.",
        StatusCodes.CONFLICT,
        "EMAIL_TAKEN",
      );
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    return await this.authRepository.createUser({
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      passwordHash,
    });
  }

  public async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.authRepository.findUserByEmail(
      input.email.toLowerCase(),
    );
    if (!user) {
      throw new AppError(
        "Invalid email or password.",
        StatusCodes.UNAUTHORIZED,
        "INVALID_CREDENTIALS",
      );
    }

    const passwordMatches = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new AppError(
        "Invalid email or password.",
        StatusCodes.UNAUTHORIZED,
        "INVALID_CREDENTIALS",
      );
    }

    if (!user.isActive) {
      throw new AppError(
        "Your account is inactive.",
        StatusCodes.FORBIDDEN,
        "ACCOUNT_INACTIVE",
      );
    }

    if (!user.isVerified)
      throw new AppError(
        "Your email is not verified ",
        StatusCodes.FORBIDDEN,
        "EMAIL_NOT_VERIFIED",
      );

    const tokens = this.tokenService.issueTokens({
      email: user.email,
      role: user.role,
      userId: user.id,
    });

    await this.authRepository.storeRefreshToken({
      userId: user.id,
      tokenHash: this.hashRefreshToken(tokens.refreshToken),
      expiresAt: this.tokenService.getRefreshTokenExpiryDate(),
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  public async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const hashedRefreshToken = this.hashRefreshToken(refreshToken);
    const storedToken =
      await this.authRepository.findRefreshToken(hashedRefreshToken);

    if (
      !storedToken ||
      storedToken.userId !== payload.userId ||
      storedToken.revokedAt
    ) {
      throw new AppError(
        "Refresh token is invalid.",
        StatusCodes.UNAUTHORIZED,
        "INVALID_REFRESH_TOKEN",
      );
    }

    const nextTokens = this.tokenService.issueTokens(payload);
    await this.authRepository.revokeRefreshToken(hashedRefreshToken);
    await this.authRepository.storeRefreshToken({
      userId: payload.userId,
      tokenHash: this.hashRefreshToken(nextTokens.refreshToken),
      expiresAt: this.tokenService.getRefreshTokenExpiryDate(),
    });

    return nextTokens;
  }

  public async getMe(userId: string): Promise<User> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AppError(
        "User was not found.",
        StatusCodes.NOT_FOUND,
        "USER_NOT_FOUND",
      );
    }

    return user;
  }

  private hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  public async verifyEmail(verifyToken: string): Promise<AuthResult> {
    let user = await this.authRepository.verifyEmail(verifyToken);

    const token = this.tokenService.issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.authRepository.storeRefreshToken({
      userId: user.id,
      tokenHash: this.hashRefreshToken(token.refreshToken),
      expiresAt: this.tokenService.getRefreshTokenExpiryDate(),
    });

    return { user: user, tokens: token };
  }

  public async resendVerifyEmail(email: string): Promise<{ message: string }> {
    return this.authRepository.resendVerifyEmail(email);
  }
}
