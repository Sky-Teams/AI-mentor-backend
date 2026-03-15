export interface PasswordHasher {
  hash(value: string): Promise<string>;
  verify(value: string, hash: string): Promise<boolean>;
}
