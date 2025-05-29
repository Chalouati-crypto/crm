import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { appointments, contacts, users } from "@/server/schema";
import { db } from "@/server";

export async function GET() {
  const allAppointments = await db
    .select()
    .from(appointments)
    .leftJoin(contacts, eq(appointments.contactId, contacts.id))
    .leftJoin(users, eq(appointments.userId, users.id));
  return NextResponse.json(allAppointments);
}

export async function POST(req: Request) {
  const data = await req.json();

  // Validate contact and user exist
  const [contact, user] = await Promise.all([
    db.select().from(contacts).where(eq(contacts.id, data.contactId)),
    db.select().from(users).where(eq(users.id, data.userId)),
  ]);

  if (!contact.length || !user.length) {
    return NextResponse.json(
      { error: "Invalid contact or user" },
      { status: 400 }
    );
  }

  const newAppointment = await db.insert(appointments).values(data).returning();
  return NextResponse.json(newAppointment[0], { status: 201 });
}
