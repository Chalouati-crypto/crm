import { db } from "@/server";
import { userAccounts } from "@/server/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = await params;
    console.log("this is the id", accountId);
    const assignedUsers = await db.query.userAccounts.findMany({
      where: eq(userAccounts.accountId, accountId),
      with: {
        user: true,
      },
    });

    console.log("these are the assigned users", assignedUsers);
    return NextResponse.json(assignedUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
