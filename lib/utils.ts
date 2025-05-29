import { getCalendarData } from "@/server/actions/calendar-queries";
import bcrypt from "bcryptjs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDateLocal = (datetime) => {
  if (!(datetime instanceof Date) || isNaN(datetime)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${datetime.getFullYear()}-${pad(datetime.getMonth() + 1)}-${pad(
    datetime.getDate()
  )}T${pad(datetime.getHours())}:${pad(datetime.getMinutes())}`;
};
export async function saltAndHashPassword(pwd: string, rounds: number = 10) {
  const hashedPassword = await bcrypt.hash(pwd, rounds);
  return hashedPassword;
}
interface CalendarDay {
  date: number;
  hasAppointment: boolean;
  appointmentCount?: number;
}

interface CalendarWeek {
  days: CalendarDay[];
}

export async function getSampleWeeks(
  startDate: Date,
  numberOfWeeks: number
): Promise<CalendarWeek[]> {
  const weeks: CalendarWeek[] = [];

  for (let w = 0; w < numberOfWeeks; w++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + w * 7);

    const weekData = await getCalendarData(weekStart);

    const days: CalendarDay[] = weekData.map((day) => ({
      date: day.date.getDate(),
      hasAppointment: day.appointments.length > 0,
      ...(day.appointments.length > 0 && {
        appointmentCount: day.appointments.length,
      }),
    }));

    weeks.push({ days });
  }

  return weeks;
}
