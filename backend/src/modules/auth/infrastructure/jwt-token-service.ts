import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../../../shared/config/env";
import { AppError } from "../../../shared/errors/app-error";
import type { TokenPair, TokenPayload, TokenService } from "../domain/token-service";

export class JwtTokenService implements TokenService {
  public issueTokens(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_TTL,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_TTL,
    });

    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw new AppError("Access token is invalid.", StatusCodes.UNAUTHORIZED, "INVALID_ACCESS_TOKEN");
    }
  }

  public verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw new AppError("Refresh token is invalid.", StatusCodes.UNAUTHORIZED, "INVALID_REFRESH_TOKEN");
    }
  }

  public getRefreshTokenExpiryDate(): Date {
    const now = new Date();
    now.setDate(now.getDate() + 30);
    return now;
  }
}
