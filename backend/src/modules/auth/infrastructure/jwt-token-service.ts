import jwt, { type SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../../../shared/config/env";
import { AppError } from "../../../shared/errors/app-error";
import type {
  TokenPair,
  TokenPayload,
  TokenService,
} from "../domain/token-service";

export class JwtTokenService implements TokenService {
  public issueTokens(payload: TokenPayload): TokenPair {
    const cleanPayload = {
      email: payload.email,
      userId: payload.userId,
      role: payload.role,
    };

    const accessTokenTtl = env.JWT_ACCESS_TTL as SignOptions["expiresIn"];
    const refreshTokenTtl = env.JWT_REFRESH_TTL as SignOptions["expiresIn"];

    const accessToken = jwt.sign(cleanPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: accessTokenTtl,
    });
    const refreshToken = jwt.sign(cleanPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: refreshTokenTtl,
    });

    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw new AppError(
        "Access token is invalid.",
        StatusCodes.UNAUTHORIZED,
        "INVALID_ACCESS_TOKEN",
      );
    }
  }

  public verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw new AppError(
        "Refresh token is invalid.",
        StatusCodes.UNAUTHORIZED,
        "INVALID_REFRESH_TOKEN",
      );
    }
  }

  public getRefreshTokenExpiryDate(): Date {
    const now = new Date();
    now.setDate(now.getDate() + 30);
    return now;
  }
}
