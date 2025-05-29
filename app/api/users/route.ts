import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { users } from "@/server/schema";
import { db } from "@/server";

export async function GET() {
  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}

export async function POST(req: Request) {
  const data = await req.json();

  // Validate email uniqueness
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email));

  if (existingUser.length) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );
  }

  const newUser = await db.insert(users).values(data).returning();
  return NextResponse.json(newUser[0], { status: 201 });
}
