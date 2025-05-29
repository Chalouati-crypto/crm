import { getCalendarData } from "@/server/actions/calendar-queries";
import { NextResponse } from "next/server";

export async function GET() {
  const startDate = new Date(); // → Saturday May 24, 2025

  const weeks = [];

  for (let w = 0; w < 3; w++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + w * 7);

    const weekData = await getCalendarData(weekStart);

    const days = weekData.map((day) => ({
      date: day.date.getDate(),
      hasAppointment: day.appointments.length > 0,
      ...(day.appointments.length > 0 && {
        appointmentCount: day.appointments.length,
      }),
    }));

    weeks.push({ days });
  }

  return NextResponse.json(weeks);
}
