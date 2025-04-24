//types/register-schema.ts
import * as z from "zod";
export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(1, {
    message: "password is required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});
