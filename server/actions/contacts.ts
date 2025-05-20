"use server";
import { actionClient } from "@/lib/safe-actions";
import { db } from "..";
import { clientAccounts, contacts, userAccounts } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ContactSchema } from "@/types/contact-schema";

export async function getContacts(accountId: string | undefined) {
  if (!accountId) return db.select().from(contacts);
  return db.select().from(contacts).where(eq(contacts.accountId, accountId));
}
export const upsertContact = actionClient
  .schema(ContactSchema)
  .action(async ({ parsedInput }) => {
    try {
      const values = parsedInput;
      console.log("hello, this is teh values", values);
      const id = values?.id;
      if (id) {
        // update
        const result = await db
          .update(contacts)
          .set(values)
          .where(eq(contacts.id, id))
          .returning();
        revalidatePath("/contacts");
        return { success: `contact ${result[0].firstName} modifiee` };
      } else {
        const result = await db.insert(contacts).values(values).returning();
        revalidatePath("/contacts");
        return { success: `contact ${result[0].firstName} Ajoutee` };
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
export const deleteContact = actionClient
  .schema(z.object({ id: z.string().uuid() }))

  .action(async ({ parsedInput }) => {
    console.log("this is the values", parsedInput);
    try {
      const data = await db
        .delete(contacts)
        .where(eq(contacts.id, parsedInput.id))
        .returning();
      revalidatePath("/contacts");

      return { success: `contact ${data[0].firstName} successfully deleted` };
    } catch (error) {
      console.log(error);
      return { error: "failed to delete student" };
    }
  });
export const archiveContact = actionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      const data = await db
        .update(contacts)
        .set({ status: "inactive" })
        .where(eq(contacts.id, parsedInput.id))
        .returning();
      revalidatePath("/contacts");
      return { success: `contact ${data[0].firstName} successfully archived` };
    } catch (error) {
      console.log(error);
      return { error: "failed to archive student" };
    }
  });
export async function getContact(contactId: string | undefined) {
  if (!contactId) return null;
  const [contact] = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      accountId: contacts.accountId,
    })
    .from(contacts)
    .where(eq(contacts.id, contactId));
  return contact ?? null;
}
export async function getAssignedContacts(userId: string | undefined) {
  if (!userId) return [];

  // First get all assigned accounts with their contacts
  const results = await db
    .select({
      account: clientAccounts,
      contact: contacts,
    })
    .from(userAccounts)
    .innerJoin(clientAccounts, eq(userAccounts.accountId, clientAccounts.id))
    .innerJoin(contacts, eq(clientAccounts.id, contacts.accountId))
    .where(eq(userAccounts.userId, userId));

  // Group contacts by their account
  const groupedResults = results.reduce(
    (acc, { account, contact }) => {
      const existing = acc.find((a) => a.account.id === account.id);
      if (existing) {
        existing.contacts.push(contact);
      } else {
        acc.push({
          account: account,
          contacts: [contact],
        });
      }
      return acc;
    },
    [] as Array<{
      account: typeof clientAccounts.$inferSelect;
      contacts: (typeof contacts.$inferSelect)[];
    }>
  );

  return groupedResults;
}
