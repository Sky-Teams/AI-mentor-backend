import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1),
});
