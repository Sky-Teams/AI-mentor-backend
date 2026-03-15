import type { AuthContext } from "./shared/http/auth-context";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
