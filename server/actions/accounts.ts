"use server";
import { actionClient } from "@/lib/safe-actions";
import { db } from "..";
import { clientAccounts, userAccounts } from "../schema";
import { ClientAccountSchema } from "@/types/account-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAccounts(userid: string | undefined) {
  if (!userid) return db.select().from(clientAccounts);
  if (userid) {
    const result = await db
      .select({
        clientAccount: clientAccounts, // Directly select all clientAccounts fields
      })
      .from(userAccounts)
      .innerJoin(
        clientAccounts,
        eq(clientAccounts.id, userAccounts.accountId) // Join on accountId
      )
      .where(eq(userAccounts.userId, userid)); // Filter by user ID

    // Extract clientAccounts from the result
    return result.map((row) => row.clientAccount);
  }
}
export const upsertClientAccount = actionClient
  .schema(ClientAccountSchema)
  .action(async ({ parsedInput }) => {
    try {
      const values = parsedInput;
      console.log("hello, this is teh values", values);
      const id = values?.id;
      if (id) {
        // update
        const result = await db
          .update(clientAccounts)
          .set(values)
          .where(eq(clientAccounts.id, id))
          .returning();
        revalidatePath("/accounts");
        return { success: `compte ${result[0].name} modifiee` };
      } else {
        const result = await db
          .insert(clientAccounts)
          .values(values)
          .returning();
        revalidatePath("/accounts");
        return { success: `compte ${result[0].name} Ajoutee` };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Database operation failed",
      };
    }
  });
export const deleteAccount = actionClient
  .schema(z.object({ id: z.string().uuid() }))

  .action(async ({ parsedInput }) => {
    console.log("this is the values", parsedInput);
    try {
      const data = await db
        .delete(clientAccounts)
        .where(eq(clientAccounts.id, parsedInput.id))
        .returning();
      revalidatePath("/accounts");

      return { success: `account ${data[0].name} successfully deleted` };
    } catch (error) {
      console.log(error);
      return { error: "failed to delete student" };
    }
  });
// server/actions/accounts.ts

export async function getAccount(accountId: string | undefined) {
  if (!accountId) return null;
  const [account] = await db
    .select({
      id: clientAccounts.id,
      name: clientAccounts.name,
      industry: clientAccounts.industry,
      parentAccountId: clientAccounts.parent_account_id,
      createdAt: clientAccounts.created_at,
    })
    .from(clientAccounts)
    .where(eq(clientAccounts.id, accountId));
  return account ?? null;
}
