"use server";

import { actionClient } from "@/lib/safe-actions";
import { db } from "..";
import { userAccounts, users } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AssignConsultantsSchema = z.object({
  accountId: z.string().uuid(),
  consultantIds: z.array(z.string().uuid()),
});

export async function getConsultants() {
  return db.select().from(users).where(eq(users.role, "consultant"));
}

export const assignConsultants = actionClient
  .schema(AssignConsultantsSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { accountId, consultantIds } = parsedInput;
      console.log("Assigning consultants:", { accountId, consultantIds });

      // Delete existing assignments
      await db
        .delete(userAccounts)
        .where(eq(userAccounts.accountId, accountId));

      // Insert new assignments if any
      if (consultantIds.length > 0) {
        await db.insert(userAccounts).values(
          consultantIds.map((userId: string) => ({
            accountId,
            userId,
          }))
        );
      }

      revalidatePath("/accounts");
      revalidatePath(`/accounts/${accountId}`);
      return {
        success: `Successfully updated consultants for account ${accountId}`,
      };
    } catch (error) {
      console.error("Assignment error:", error);
      return {
        error: "Failed to update consultants",
      };
    }
  });
