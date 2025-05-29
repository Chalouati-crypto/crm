import { NextResponse } from "next/server";
import { userAccounts, users, clientAccounts } from "@/server/schema";
import { eq } from "drizzle-orm";
import { db } from "@/server";

export async function POST(req: Request) {
  const { userId, accountId } = await req.json();

  // Validate user and account exist
  const [user, account] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)),
    db.select().from(clientAccounts).where(eq(clientAccounts.id, accountId)),
  ]);

  if (!user.length || !account.length) {
    return NextResponse.json(
      { error: "Invalid user or account" },
      { status: 400 }
    );
  }

  const newLink = await db
    .insert(userAccounts)
    .values({ userId, accountId })
    .returning();
  return NextResponse.json(newLink[0], { status: 201 });
}
