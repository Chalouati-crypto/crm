import { z } from "zod";

// Contact Status Enum
export const ContactStatusEnum = z.enum(["active", "inactive", "pending"]);
export type ContactStatus = z.infer<typeof ContactStatusEnum>;

// Contact Schema
export const ContactSchema = z.object({
  id: z.string().uuid().optional(),
  accountId: z.string().min(1, "Account ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  status: ContactStatusEnum.default("active"),
  createdBy: z.string().uuid().optional().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type Contact = z.infer<typeof ContactSchema>;
