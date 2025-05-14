"use server";
import { actionClient } from "@/lib/safe-actions";
import { db } from "..";
import { appointments, contacts } from "../schema";
import { AppointmentSchema } from "@/types/appointment-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function getAppointments() {
  return db.select().from(appointments); // Ensure Appointments is a valid database table object
}
export const upsertAppointment = actionClient
  .schema(AppointmentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const values = parsedInput;
      console.log("Starting appointment update:", values); // Debug 1

      const id = values?.id;
      let previousStatus: "scheduled" | "completed" | "canceled" | null = null;
      if (id) {
        const [existingAppointment] = await db
          .select()
          .from(appointments)
          .where(eq(appointments.id, id));

        previousStatus = existingAppointment?.status;
        console.log("Previous status:", previousStatus); // Debug 2
        const operation = id ? "update" : "insert";
        // update
        const result = await db
          .update(appointments)
          .set(values)
          .where(eq(appointments.id, id))
          .returning();
        revalidatePath("/appointments");
        // return { success: `Appointment ${result[0].id} modifiee` };
      } else {
        const result = await db.insert(appointments).values(values).returning();
        revalidatePath("/appointments");
        // return { success: `appointment ${result[0].id} Ajoutee` };
      }
      if (values.status === "completed" && previousStatus !== "completed") {
        console.log("Attempting to send survey email"); // Debug 3

        try {
          const [contact] = await db
            .select({ email: contacts.email })
            .from(contacts)
            .where(eq(contacts.id, values.contactId));
          console.log("Contact found:", contact?.email); // Debug 4

          if (contact?.email) {
            console.log("Sending to:", contact.email); // Debug 5

            const surveyLink = `${process.env.NEXTAUTH_URL}/survey/${result[0].id}`;
            console.log("Survey link:", surveyLink); // Debug 6

            await resend.emails.send({
              from: "CRM <surveys@yourdomain.com>",
              to: contact.email,
              subject: "Feedback Request - How Did We Do?",
              html: `
                <h3>Please rate your recent experience</h3>
                <p>Click below to complete the survey:</p>
                <a href="${surveyLink}">Submit Feedback</a>
                <p>Questions include:</p>
                <ul>
                  <li>Global service rating (1-5)</li>
                  <li>Service quality feedback</li>
                  <li>Improvement suggestions</li>
                </ul>
              `,
            });

            return {
              success: `appointment ${operation === "insert" ? "Ajoutee" : "modifiee"}`,
            };

            console.log("Email API response:", emailRes); // Debug 7
          }
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          // Don't throw error - appointment should still save
        }
      }
    } catch (error) {
      console.log(error);
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
