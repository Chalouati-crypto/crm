"use server";
// Database query functions for calendar appointments
import { sql, eq, and, gte, lte } from "drizzle-orm";
import { db } from "..";
import { appointments, contacts } from "../schema";

export interface AppointmentCalendarData {
  date: Date;
  appointments: {
    id: string;
    startTime: Date;
    endTime: Date;
    purpose: string;
    contactName: string;
    status: string;
  }[];
}

export async function getWeeklyAppointments(startDate: Date, endDate: Date) {
  const weeklyAppointments = await db
    .select({
      id: appointments.id,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      purpose: appointments.purpose,
      status: appointments.status,
      contactName: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`,
    })
    .from(appointments)
    .leftJoin(contacts, eq(appointments.contactId, contacts.id))
    .where(
      and(
        gte(appointments.startTime, startDate),
        lte(appointments.startTime, endDate)
      )
    )
    .orderBy(appointments.startTime);

  return weeklyAppointments;
}

export async function getDailyAppointmentCount(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(appointments)
    .where(
      and(
        gte(appointments.startTime, startOfDay),
        lte(appointments.startTime, endOfDay),
        eq(appointments.status, "scheduled")
      )
    );

  return count[0]?.count || 0;
}

export async function getCalendarData(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const appointments = await getWeeklyAppointments(weekStart, weekEnd);

  // Group appointments by day
  const calendarData: AppointmentCalendarData[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(currentDate.getDate() + i);

    const dayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === currentDate.toDateString();
    });

    calendarData.push({
      date: currentDate,
      appointments: dayAppointments,
    });
  }

  return calendarData;
}
