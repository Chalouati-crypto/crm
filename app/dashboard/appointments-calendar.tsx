"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CalendarDay {
  date: number;
  hasAppointment: boolean;
  appointmentCount?: number;
}

interface CalendarWeek {
  days: CalendarDay[];
}

export function AppointmentCalendar() {
  const [currentWeek, setCurrentWeek] = useState(0);

  const sampleWeeks: CalendarWeek[] = [
    {
      days: [
        { date: 1, hasAppointment: false },
        { date: 2, hasAppointment: true, appointmentCount: 3 },
        { date: 3, hasAppointment: true, appointmentCount: 2 },
        { date: 4, hasAppointment: true, appointmentCount: 4 },
        { date: 5, hasAppointment: true, appointmentCount: 1 },
        { date: 6, hasAppointment: false },
        { date: 7, hasAppointment: false },
      ],
    },
    {
      days: [
        { date: 8, hasAppointment: false },
        { date: 9, hasAppointment: true, appointmentCount: 2 },
        { date: 10, hasAppointment: true, appointmentCount: 3 },
        { date: 11, hasAppointment: true, appointmentCount: 1 },
        { date: 12, hasAppointment: true, appointmentCount: 2 },
        { date: 13, hasAppointment: true, appointmentCount: 4 },
        { date: 14, hasAppointment: false },
      ],
    },
    {
      days: [
        { date: 15, hasAppointment: false },
        { date: 16, hasAppointment: true, appointmentCount: 1 },
        { date: 17, hasAppointment: true, appointmentCount: 2 },
        { date: 18, hasAppointment: true, appointmentCount: 3 },
        { date: 19, hasAppointment: true, appointmentCount: 1 },
        { date: 20, hasAppointment: false },
        { date: 21, hasAppointment: false },
      ],
    },
  ];

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const timeSlots = [
    { id: "slot-1", label: "9AM" },
    { id: "slot-2", label: "11AM" },
    { id: "slot-3", label: "1PM" },
    { id: "slot-4", label: "3PM" },
    { id: "slot-5", label: "5PM" },
  ];

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev" && currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
    } else if (direction === "next" && currentWeek < sampleWeeks.length - 1) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const currentWeekData = sampleWeeks[currentWeek];

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
              disabled={currentWeek === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("next")}
              disabled={currentWeek === sampleWeeks.length - 1}
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
        <div className="space-y-1">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot.id} className="grid grid-cols-8 gap-1">
              <div className="flex items-center justify-center text-sm font-medium text-gray-600 py-2">
                {timeSlot.label}
              </div>
              {currentWeekData.days.map((day, dayIndex) => (
                <div
                  key={`${timeSlot.id}-day-${dayIndex}`}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-colors
                    ${
                      day.hasAppointment && Math.random() > 0.3
                        ? "bg-[#952CA7] text-white hover:bg-purple-700"
                        : "bg-purple-100 text-purple-300 hover:bg-purple-200"
                    }
                  `}
                  title={
                    day.hasAppointment && Math.random() > 0.3
                      ? `${day.appointmentCount || 1} appointment(s)`
                      : "No appointments"
                  }
                ></div>
              ))}
            </div>
          ))}
        </div>

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
