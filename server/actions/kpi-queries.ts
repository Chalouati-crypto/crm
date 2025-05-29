// Database query functions for your KPI metrics
// You would use these with your Drizzle ORM setup
"use server";
import { db } from "@/server";
import { appointments, contacts, surveys } from "@/server/schema";
import { sql, avg, count, eq, gte } from "drizzle-orm";

export async function getClientSatisfactionScore() {
  const result = await db
    .select({
      averageRating: avg(surveys.overallRating),
    })
    .from(surveys);

  return result[0]?.averageRating || 0;
}

export async function getSurveyResponseRate() {
  // This assumes you have a way to track "surveys sent"
  // You might need to add a separate table for tracking sent surveys
  const totalSurveys = await db.select({ count: count() }).from(surveys);

  const completedSurveys = await db
    .select({ count: count() })
    .from(surveys)
    .where(sql`${surveys.completedAt} IS NOT NULL`);

  const total = totalSurveys[0]?.count || 0;
  const completed = completedSurveys[0]?.count || 0;

  return total > 0 ? (completed / total) * 100 : 0;
}

export async function getCompletedAppointmentsRate() {
  const totalAppointments = await db
    .select({ count: count() })
    .from(appointments);

  const completedAppointments = await db
    .select({ count: count() })
    .from(appointments)
    .where(eq(appointments.status, "completed"));

  const total = totalAppointments[0]?.count || 0;
  const completed = completedAppointments[0]?.count || 0;

  return total > 0 ? (completed / total) * 100 : 0;
}

export async function getActiveClientAccounts() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // This assumes you have a way to track last interaction
  // You might need to add a lastInteraction field to contacts table
  // or derive it from the most recent appointment
  const activeContacts = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${contacts.id})`,
    })
    .from(contacts)
    .leftJoin(appointments, eq(contacts.id, appointments.contactId))
    .where(gte(appointments.createdAt, thirtyDaysAgo));

  return activeContacts[0]?.count || 0;
}

// Function to get all KPI data at once
export async function getAllKPIData() {
  const [satisfactionScore, responseRate, completionRate, activeAccounts] =
    await Promise.all([
      getClientSatisfactionScore(),
      getSurveyResponseRate(),
      getCompletedAppointmentsRate(),
      getActiveClientAccounts(),
    ]);

  return {
    satisfactionScore: Number(satisfactionScore).toFixed(1),
    responseRate: `${Math.round(responseRate)}%`,
    completionRate: `${Math.round(completionRate)}%`,
    activeAccounts: activeAccounts.toString(),
  };
}
