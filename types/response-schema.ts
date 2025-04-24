import { z } from "zod";

export const SurveyResponseSchema = z.object({
  overallRating: z.number().int().min(1).max(5),
  serviceQuality: z.number().int().min(1).max(5),
  suggestions: z.string().optional(),
});
