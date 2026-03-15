import type { AuthContext } from "../../../shared/http/auth-context";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload extends AuthContext {}

export interface TokenService {
  issueTokens(payload: TokenPayload): TokenPair;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
  getRefreshTokenExpiryDate(): Date;
}
