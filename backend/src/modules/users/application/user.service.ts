import { PasswordHasher } from "src/modules/auth/domain/password-hasher";
import { User, UserRepository } from "../domain/user";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";

export class UserService {
  public constructor(
    private readonly passwordHasher: PasswordHasher,
    private readonly userRepository: UserRepository,
  ) {}

  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    let user = await this.userRepository.getUserById(userId);

    const passwordMatches = await this.passwordHasher.verify(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches)
      throw new AppError(
        "Invalid current password.",
        StatusCodes.BAD_REQUEST,
        "INVALID_CREDENTIALS",
      );

    const isSamePassword = await this.passwordHasher.verify(
      newPassword,
      user.passwordHash,
    );

    if (isSamePassword)
      throw new AppError(
        "New password cannot be the same as the current password.",
        StatusCodes.BAD_REQUEST,
        "SAME_PASSWORD_NOT_ALLOWED",
      );

    const hashPassword = await this.passwordHasher.hash(newPassword);

    return await this.userRepository.changePassword(userId, hashPassword);
  }

  public async updateProfile(userId: string, fullName: string): Promise<User> {
    await this.userRepository.getUserById(userId);

    return await this.userRepository.updateProfile(userId, fullName);
  }
}
