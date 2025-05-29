import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server";
import { appointments, contacts, surveys } from "@/server/schema";

export async function POST(req: Request) {
  const data = await req.json();

  // Validate appointment and contact exist
  const [appointment, contact] = await Promise.all([
    db
      .select()
      .from(appointments)
      .where(eq(appointments.id, data.appointmentId)),
    db.select().from(contacts).where(eq(contacts.id, data.contactId)),
  ]);

  if (!appointment.length || !contact.length) {
    return NextResponse.json(
      { error: "Invalid appointment or contact" },
      { status: 400 }
    );
  }

  const newSurvey = await db.insert(surveys).values(data).returning();
  return NextResponse.json(newSurvey[0], { status: 201 });
}
