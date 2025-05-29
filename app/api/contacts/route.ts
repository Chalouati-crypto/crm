import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { clientAccounts, contacts } from "@/server/schema";
import { db } from "@/server";

export async function GET() {
  const allContacts = await db
    .select()
    .from(contacts)
    .leftJoin(clientAccounts, eq(contacts.accountId, clientAccounts.id));
  return NextResponse.json(allContacts);
}

export async function POST(req: Request) {
  const data = await req.json();

  // Validate account exists
  const account = await db
    .select()
    .from(clientAccounts)
    .where(eq(clientAccounts.id, data.accountId));
  if (!account.length)
    return NextResponse.json({ error: "Account not found" }, { status: 400 });

  const newContact = await db.insert(contacts).values(data).returning();
  return NextResponse.json(newContact[0], { status: 201 });
}
