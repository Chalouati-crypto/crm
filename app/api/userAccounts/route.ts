import { db } from "@/server";
import { clientAccounts } from "@/server/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const accounts = await db.select().from(clientAccounts);
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const data = await req.json();

  // Validate parent account exists if provided
  if (data.parent_account_id) {
    const parent = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.id, data.parent_account_id));
    if (!parent.length)
      return NextResponse.json(
        { error: "Parent account not found" },
        { status: 400 }
      );
  }

  const newAccount = await db.insert(clientAccounts).values(data).returning();
  return NextResponse.json(newAccount[0], { status: 201 });
}
