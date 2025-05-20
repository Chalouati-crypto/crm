import { z } from "zod";

const roles = ["consultant", "admin"] as const;

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  image: z
    .string()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal("")),
  role: z.enum(roles),
});
export const updateUserSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional().or(z.literal("")),
  role: z.enum(["admin", "consultant"]).optional(),
});

// 3) Full User schema (what comes back from the DB)
export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.date().optional(),
  image: z.string().url().nullable().optional(),
  password: z.string(),
  role: z.enum(roles),
});

// 4) TypeScript types (inferred)
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type User = z.infer<typeof userSchema>;
