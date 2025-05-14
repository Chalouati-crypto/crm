// app/api/users/route.ts
import { db } from "@/server";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "consultant"));
    console.log("these are all the users", allUsers);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
