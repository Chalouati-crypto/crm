// Add this CSS to your global styles or component
"use client";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { Appointment } from "@/types/appointment-schema";

const calendarStyles = `
  /* Main calendar container */
  .rbc-calendar {
    font-family: 'Inter', sans-serif;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  /* Header styling */
  .rbc-toolbar {
    background-color: #f3f4f6;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  /* Date header cells */
  .rbc-header {
    background-color: #f9fafb;
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    color: #374151;
    font-weight: 500;
  }

  /* Time slots */
  .rbc-time-view .rbc-time-content {
    border-left: 1px solid #e5e7eb;
  }

  /* Events styling */
  .rbc-event {
    background-color: #3b82f6;
    border-radius: 4px;
    border: none;
    padding: 4px 8px;
    font-size: 14px;
    color: white;
  }

  /* Event colors based on status */
  .rbc-event.completed {
    background-color: #10b981;
  }
  
  .rbc-event.canceled {
    background-color: #ef4444;
  }

  /* Time grid lines */
  .rbc-time-gutter {
    color: #6b7280;
    font-size: 14px;
  }

  /* Agenda view table styling */
  .rbc-agenda-view table {
    width: 100%;
    border-collapse: collapse;
  }

  .rbc-agenda-view th,
  .rbc-agenda-view td {
    padding: 12px;
    border: 1px solid #e5e7eb;
    text-align: left;
  }

  /* Today highlight */
  .rbc-today {
    background-color: #f0f9ff;
  }

  /* Button styling */
  .rbc-btn {
    color: #3b82f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 6px 12px;
    background: white;
    transition: all 0.2s;
  }

  .rbc-btn:hover {
    background-color: #f3f4f6;
  }
`;
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: {
    status: "scheduled" | "completed" | "canceled";
    notes?: string;
    contactId: string;
    id: string;
  };
}
const mapAppointmentsToEvents = (appointments: Appointment[]) => {
  return appointments.map((appointment) => ({
    title: appointment.purpose,
    start: new Date(appointment.startTime), // Ensure valid Date
    end: new Date(appointment.endTime), // Ensure valid Date
    allDay: false,
    resource: {
      status: appointment.status,
      notes: appointment.notes,
      contactId: appointment.contactId,
      id: appointment.id,
    },
  }));
};

const localizer = momentLocalizer(moment);
// Add the styles to your component
export const AppointmentCalendar = ({
  appointments,
}: {
  appointments: Appointment[];
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    return mapAppointmentsToEvents(appointments || []);
  });

  // Add useEffect to update when appointments change
  useEffect(() => {
    setEvents(mapAppointmentsToEvents(appointments || []));
  }, [appointments]);
  const handleEventClick = (event: any) => {
    console.log("Selected appointment:", event.resource);
  };
  return (
    <>
      <style>{calendarStyles}</style>
      <div className="h-[800px] p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={["month", "week", "day"]}
          onSelectEvent={handleEventClick}
          eventPropGetter={(event: CalendarEvent) => ({
            style: {
              backgroundColor: {
                scheduled: "#3b82f6",
                completed: "#10b981",
                canceled: "#ef4444",
              }[event.resource.status],
              color: "white",
              borderRadius: "4px",
              border: "none",
            },
          })}
        />
      </div>
    </>
  );
};
