import type { Role } from "../../modules/users/domain/user";

export interface AuthContext {
  userId: string;
  role: Role;
  email: string;
}
