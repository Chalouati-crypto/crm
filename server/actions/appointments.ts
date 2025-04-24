"use server";
import { actionClient } from "@/lib/safe-actions";
import { db } from "..";
import { appointments } from "../schema";
import { AppointmentSchema } from "@/types/appointment-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
export async function getAppointments() {
  return db.select().from(appointments); // Ensure Appointments is a valid database table object
}
export const upsertAppointment = actionClient
  .schema(AppointmentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const values = parsedInput;
      console.log("hello, this is teh values", values);
      const id = values?.id;
      if (id) {
        // update
        const result = await db
          .update(appointments)
          .set(values)
          .where(eq(appointments.id, id))
          .returning();
        revalidatePath("/appointments");
        return { success: `Appointment ${result[0].id} modifiee` };
      } else {
        const result = await db.insert(appointments).values(values).returning();
        revalidatePath("/appointments");
        return { success: `appointment ${result[0].id} Ajoutee` };
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
