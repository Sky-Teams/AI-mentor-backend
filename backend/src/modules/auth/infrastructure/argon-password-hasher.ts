import argon2 from "argon2";
import type { PasswordHasher } from "../domain/password-hasher";

export class ArgonPasswordHasher implements PasswordHasher {
  public async hash(value: string): Promise<string> {
    return argon2.hash(value);
  }

  public async verify(value: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, value);
  }
}
