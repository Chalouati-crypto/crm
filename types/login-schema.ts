//types/login-schema.ts
import * as z from "zod";
export const LoginSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(1, {
    message: "password is required",
  }),
});
