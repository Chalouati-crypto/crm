"use server";
// Database query functions for appointment trends
import { sql } from "drizzle-orm";
import { appointments } from "../schema";
import { db } from "..";

export async function getMonthlyAppointmentTrends() {
  // Get appointment completion data for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await db
    .select({
      month: sql<string>`TO_CHAR(${appointments.createdAt}, 'Month')`,
      monthNumber: sql<number>`EXTRACT(MONTH FROM ${appointments.createdAt})`,
      appointments: sql<number>`COUNT(*)`,
    })
    .from(appointments)
    .where(
      sql`${appointments.createdAt} >= ${sixMonthsAgo} AND ${appointments.status} = 'completed'`
    )
    .groupBy(
      sql`EXTRACT(MONTH FROM ${appointments.createdAt}), TO_CHAR(${appointments.createdAt}, 'Month')`
    )
    .orderBy(sql`EXTRACT(MONTH FROM ${appointments.createdAt})`);

  return monthlyData.map((row) => ({
    month: row.month.trim(),
    appointments: row.appointments,
  }));
}

export async function getWeeklyAppointmentTrends() {
  // Alternative: Get weekly data for the last 8 weeks
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const weeklyData = await db
    .select({
      week: sql<string>`TO_CHAR(${appointments.createdAt}, 'YYYY-"W"WW')`,
      weekStart: sql<string>`TO_CHAR(DATE_TRUNC('week', ${appointments.createdAt}), 'Mon DD')`,
      appointments: sql<number>`COUNT(*)`,
    })
    .from(appointments)
    .where(
      sql`${appointments.createdAt} >= ${eightWeeksAgo} AND ${appointments.status} = 'completed'`
    )
    .groupBy(
      sql`DATE_TRUNC('week', ${appointments.createdAt}), TO_CHAR(${appointments.createdAt}, 'YYYY-"W"WW'), TO_CHAR(DATE_TRUNC('week', ${appointments.createdAt}), 'Mon DD')`
    )
    .orderBy(sql`DATE_TRUNC('week', ${appointments.createdAt})`);

  return weeklyData.map((row) => ({
    month: row.weekStart, // Using month field for consistency with chart component
    appointments: row.appointments,
  }));
}

// Function to calculate trend percentage
export async function getAppointmentTrendPercentage() {
  const currentMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const currentMonthData = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(appointments)
    .where(
      sql`EXTRACT(MONTH FROM ${appointments.createdAt}) = ${currentMonth.getMonth() + 1} 
          AND EXTRACT(YEAR FROM ${appointments.createdAt}) = ${currentMonth.getFullYear()}
          AND ${appointments.status} = 'completed'`
    );

  const lastMonthData = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(appointments)
    .where(
      sql`EXTRACT(MONTH FROM ${appointments.createdAt}) = ${lastMonth.getMonth() + 1} 
          AND EXTRACT(YEAR FROM ${appointments.createdAt}) = ${lastMonth.getFullYear()}
          AND ${appointments.status} = 'completed'`
    );

  const current = currentMonthData[0]?.count || 0;
  const previous = lastMonthData[0]?.count || 0;

  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
