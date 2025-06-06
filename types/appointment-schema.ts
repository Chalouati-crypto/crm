import { z } from "zod";

export const AppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  contactId: z
    .string()
    .uuid({ message: "Please select a contact." })
    .transform((val) => (val === "" ? undefined : val))
    .refine((v) => v !== undefined, { message: "Contact is required." }),
  userId: z.string().uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "completed", "canceled"]).default("scheduled"),
});

export type Appointment = z.infer<typeof AppointmentSchema>;
