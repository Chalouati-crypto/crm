// server/actions/surveys.ts
"use server";
import { eq, inArray } from "drizzle-orm";
import { db } from "..";
import { contacts, surveys, userAccounts } from "../schema";
import { actionClient } from "@/lib/safe-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const submitSurvey = async (data: {
  appointmentId: string;
  contactId: string;
  overallRating: number;
  serviceQuality: number;
  suggestions?: string;
}) => {
  try {
    await db.insert(surveys).values({
      appointmentId: data.appointmentId,
      contactId: data.contactId,
      overallRating: data.overallRating,
      serviceQuality: data.serviceQuality,
      suggestions: data.suggestions,
    });
    return { success: true };
  } catch (error) {
    console.error("Survey submission failed:", error);
    return { error: "Failed to submit survey" };
  }
};
export async function getSurveys(userId?: string) {
  if (!userId) {
    return db.select().from(surveys); // Return all surveys if no userId
  }

  // Step 1: Get account IDs for this user
  const userAccountLinks = await db
    .select({ accountId: userAccounts.accountId })
    .from(userAccounts)
    .where(eq(userAccounts.userId, userId));

  const accountIds = userAccountLinks.map((ua) => ua.accountId);

  if (accountIds.length === 0) return []; // User has no associated accounts

  // Step 2: Get contact IDs for those accounts
  const contactLinks = await db
    .select({ contactId: contacts.id })
    .from(contacts)
    .where(inArray(contacts.accountId, accountIds));

  const contactIds = contactLinks.map((c) => c.contactId);

  if (contactIds.length === 0) return []; // No contacts for those accounts

  // Step 3: Get surveys for those contacts
  return db
    .select()
    .from(surveys)
    .where(inArray(surveys.contactId, contactIds));
}
export const deleteSurvey = actionClient
  .schema(z.object({ id: z.string().uuid() }))

  .action(async ({ parsedInput }) => {
    console.log("this is the values", parsedInput);
    try {
      const data = await db
        .delete(surveys)
        .where(eq(surveys.id, parsedInput.id))
        .returning();
      revalidatePath("/surveys");
      console.log(data);

      return { success: `survey successfully deleted` };
    } catch (error) {
      console.log(error);
      return { error: "failed to delete student" };
    }
  });
