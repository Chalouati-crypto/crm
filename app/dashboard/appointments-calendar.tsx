"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCalendarData } from "@/server/actions/calendar-queries"; // Update import path

interface AppointmentCalendarData {
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

interface CalendarDay {
  date: Date;
  appointments: any[]; // Adjusted to use actual appointment data
}

export function AppointmentCalendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay()); // Set to Sunday
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Time slots configuration
  const timeSlots = [
    { id: "slot-1", label: "9AM", start: 9, end: 11 },
    { id: "slot-2", label: "11AM", start: 11, end: 13 },
    { id: "slot-3", label: "1PM", start: 13, end: 15 },
    { id: "slot-4", label: "3PM", start: 15, end: 17 },
    { id: "slot-5", label: "5PM", start: 17, end: 19 },
  ];

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Fetch calendar data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getCalendarData(new Date(currentWeekStart));
        setCalendarDays(
          data.map((day) => ({
            date: day.date,
            appointments: day.appointments,
          }))
        );
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentWeekStart]);

  // Week navigation
  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "prev" ? -7 : 7));
    setCurrentWeekStart(newDate);
  };

  // Check if time slot has appointments
  const hasAppointmentInSlot = (
    day: CalendarDay,
    slot: (typeof timeSlots)[0]
  ) => {
    return day.appointments.some((appt) => {
      const hour = new Date(appt.startTime).getHours();
      return hour >= slot.start && hour < slot.end;
    });
  };

  // Get appointment count for a day
  const getAppointmentCount = (day: CalendarDay) => {
    return day.appointments.length;
  };

  return (
    <Card className="w-full h-fit bg-purple-50/70 border-0 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Patients Appointment
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("prev")}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("next")}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Day headers */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div></div>
          {dayLabels.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading appointments...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot.id} className="grid grid-cols-8 gap-1">
                <div className="flex items-center justify-center text-sm font-medium text-gray-600 py-2">
                  {timeSlot.label}
                </div>
                {calendarDays.map((day, dayIndex) => {
                  const hasAppointment = hasAppointmentInSlot(day, timeSlot);
                  const appointmentCount = getAppointmentCount(day);
                  return (
                    <div
                      key={`${timeSlot.id}-day-${dayIndex}`}
                      className={`
                        aspect-square rounded-lg 
                        flex items-center justify-center 
                        text-sm font-medium cursor-pointer 
                        transition-colors
                        ${
                          hasAppointment
                            ? "bg-[#952ca7] text-white hover:bg-purple-700"
                            : "bg-purple-100 text-purple-300 hover:bg-purple-200"
                        }
                      `}
                      title={
                        hasAppointment
                          ? `${appointmentCount} appointment${
                              appointmentCount === 1 ? "" : "s"
                            }`
                          : "No appointments"
                      }
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-purple-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
            <span className="text-xs text-gray-600">Has Appointments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 rounded"></div>
            <span className="text-xs text-gray-600">Available</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
