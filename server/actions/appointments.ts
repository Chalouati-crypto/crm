"use server";
import { actionClient } from "@/lib/safe-actions";
import { db } from "..";
import { appointments, contacts } from "../schema";
import { AppointmentSchema } from "@/types/appointment-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Resend } from "resend";
import { SurveyEmail } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getAppointments() {
  return db.select().from(appointments); // Ensure Appointments is a valid database table object
}
export const upsertAppointment = actionClient
  .schema(AppointmentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const values = parsedInput;
      console.log("Starting appointment update:", values);

      let result;
      let previousStatus: "scheduled" | "completed" | "canceled" | null = null;
      const operation = values.id ? "update" : "insert";

      // 1. First handle database operation
      if (values.id) {
        const [existing] = await db
          .select()
          .from(appointments)
          .where(eq(appointments.id, values.id));
        previousStatus = existing?.status;

        result = await db
          .update(appointments)
          .set(values)
          .where(eq(appointments.id, values.id))
          .returning();
      } else {
        result = await db.insert(appointments).values(values).returning();
      }

      // 2. Revalidate after successful DB operation
      revalidatePath("/appointments");

      // 3. Handle email sending if needed
      if (values.status === "completed" && previousStatus !== "completed") {
        console.log("Attempting to send survey email");

        try {
          const [contact] = await db
            .select({ email: contacts.email })
            .from(contacts)
            .where(eq(contacts.id, values.contactId));

          if (contact?.email) {
            const surveyLink = `${process.env.NEXTAUTH_URL}/surveys/${result[0].id}`;

            await resend.emails.send({
              from: "onboarding@resend.dev", // Must be verified domain
              to: contact.email,
              subject: "Feedback Request",
              react: SurveyEmail({ surveyLink }), // Use react instead of html
            });
            console.log(contact.email, surveyLink);
          }
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
      }

      // 4. Return final success message
      return {
        success: `Appointment ${result[0].id} ${
          operation === "update" ? "modifiee" : "ajoutee"
        }`,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Database operation failed",
      };
    }
  });
export const deleteAppointment = actionClient
  .schema(z.object({ id: z.string().uuid() }))

  .action(async ({ parsedInput }) => {
    console.log("this is the values", parsedInput);
    try {
      await db.delete(appointments).where(eq(appointments.id, parsedInput.id));

      revalidatePath("/accounts");

      return { success: `appointment successfully deleted` };
    } catch (error) {
      console.log(error);
      return { error: "failed to delete student" };
    }
  });
// server/actions/appointments.ts

export async function getAppointment(appointmentId: string | undefined) {
  if (!appointmentId) return null;
  const [appt] = await db
    .select({
      id: appointments.id,
      contactId: appointments.contactId,
      userId: appointments.userId,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      purpose: appointments.purpose,
      notes: appointments.notes,
      status: appointments.status,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
    })
    .from(appointments)
    .where(eq(appointments.id, appointmentId));
  return appt ?? null;
}
