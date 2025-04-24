import { z } from "zod";

export const SurveySchema = z.object({
  appointmentId: z.string().uuid(),
  contactId: z.string().uuid(),
  overallRating: z.number().int().min(1).max(5),
  serviceQuality: z.number().int().min(1).max(5),
  suggestions: z.string().optional(),
});

export type Survey = z.infer<typeof SurveySchema>;
