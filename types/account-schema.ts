import { clientAccounts, contacts } from "@/server/schema";
import type { Selectable } from "drizzle-orm";
import { z } from "zod";

// Client Account Schema
export const ClientAccountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Account name is required"),
  parent_account_id: z.string().nullable().optional(),
  industry: z.string().min(1, "Industry is required"),
  created_at: z.date().optional(),
});

export type ClientAccount = z.infer<typeof ClientAccountSchema>;

export type ClientAccountWithContacts = {
  /** The client account record */
  account: Selectable<typeof clientAccounts>;
  /** All contacts belonging to that account */
  contacts: Selectable<typeof contacts>[];
};
