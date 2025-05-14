"use client";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type React from "react";

import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import type { Appointment } from "@/types/appointment-schema";
import { toast } from "sonner";
import {
  upsertAppointment,
  deleteAppointment,
} from "@/server/actions/appointments";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Clock, Check, X } from "lucide-react";

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
    cursor: pointer;
    transition: transform 0.1s ease-in-out;
  }

  .rbc-event:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

  /* Drag and drop styles */
  .rbc-addons-dnd-resize-ew-anchor {
    width: 8px;
    height: 100%;
    cursor: ew-resize;
  }
  
  .rbc-addons-dnd-dragging {
    opacity: 0.7;
  }
  
  .rbc-addons-dnd-drag-preview {
    opacity: 0.5;
    pointer-events: none;
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

// Helper function to correctly parse dates without timezone shifting
const parseDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }

  // Parse the date string to get individual components
  const date = new Date(dateString);

  // Create a new date using the local timezone components
  // This prevents timezone conversion
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
};

const mapAppointmentsToEvents = (appointments: Appointment[]) => {
  return appointments.map((appointment) => ({
    title: appointment.purpose,
    // Use the parseDate helper to prevent timezone shifting
    start: parseDate(appointment.startTime),
    end: parseDate(appointment.endTime),
    allDay: false,
    resource: {
      status: appointment.status,
      notes: appointment.notes,
      contactId: appointment.contactId,
      id: appointment.id,
    },
  }));
};

// Format date for input fields
const formatDateForInput = (date: Date) => {
  return moment(date).format("YYYY-MM-DDTHH:mm");
};

// Configure moment to use the local timezone
moment.updateLocale("en", {
  week: {
    dow: 0, // Sunday is the first day of the week
  },
});

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export const AppointmentCalendar = ({
  appointments,
  onAppointmentUpdate,
  onAppointmentDelete,
}: {
  appointments: Appointment[];
  onAppointmentUpdate?: (appointment: Appointment) => void;
  onAppointmentDelete?: (appointmentId: string) => void;
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    return mapAppointmentsToEvents(appointments || []);
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState<
    Partial<Appointment>
  >({});

  // Add useEffect to update when appointments change
  useEffect(() => {
    setEvents(mapAppointmentsToEvents(appointments || []));
  }, [appointments]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
    setIsEditMode(false);

    // Find the full appointment data
    const appointment = appointments.find(
      (app) => app.id === event.resource.id
    );
    if (appointment) {
      setEditedAppointment(appointment);
    }
  };

  const handleEventDrop = ({ event, start, end }: any) => {
    const updatedEvents = events.map((existingEvent) => {
      if (existingEvent.resource.id === event.resource.id) {
        return {
          ...existingEvent,
          start,
          end,
        };
      }
      return existingEvent;
    });

    setEvents(updatedEvents);

    // Call your API to update the appointment
    updateAppointmentTime(event.resource.id, start, end);
  };

  const handleEventResize = ({ event, start, end }: any) => {
    const updatedEvents = events.map((existingEvent) => {
      if (existingEvent.resource.id === event.resource.id) {
        return {
          ...existingEvent,
          start,
          end,
        };
      }
      return existingEvent;
    });

    setEvents(updatedEvents);

    // Call your API to update the appointment
    updateAppointmentTime(event.resource.id, start, end);
  };

  // Function to update appointment in the database
  const updateAppointmentTime = async (id: string, start: Date, end: Date) => {
    try {
      // Find the existing appointment data
      const appointmentToUpdate = appointments.find((app) => app.id === id);

      if (!appointmentToUpdate) return;

      // Create updated appointment data
      const updatedAppointment = {
        ...appointmentToUpdate,
        startTime: start,
        endTime: end,
      };

      // Call your upsert function (same one used in the form)
      const result = await upsertAppointment(updatedAppointment);

      if (result) {
        toast.success("Appointment rescheduled successfully");
        if (onAppointmentUpdate) {
          onAppointmentUpdate(updatedAppointment);
        }
      }
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error("Failed to reschedule appointment");
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return;

    try {
      // Call the deleteAppointment server action
      const result = await deleteAppointment({ id: selectedEvent.resource.id });

      if (result.success) {
        // Update local state to remove the deleted appointment
        setEvents(
          events.filter(
            (event) => event.resource.id !== selectedEvent.resource.id
          )
        );

        toast.success("Appointment deleted successfully");
        setIsDialogOpen(false);

        // Call the callback if provided
        if (onAppointmentDelete) {
          onAppointmentDelete(selectedEvent.resource.id);
        }
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedAppointment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = async (value: string) => {
    const newStatus = value as "scheduled" | "completed" | "canceled";

    try {
      const updateResult = await upsertAppointment({
        ...editedAppointment,
        status: newStatus,
      });

      if (updateResult.success) {
        // Update local state
        setEvents(
          events.map((event) =>
            event.resource.id === editedAppointment.id
              ? { ...event, resource: { ...event.resource, status: newStatus } }
              : event
          )
        );
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!editedAppointment.id) return;

      // Ensure dates are properly formatted
      const updatedAppointment = {
        ...editedAppointment,
        startTime:
          editedAppointment.startTime instanceof Date
            ? editedAppointment.startTime
            : new Date(editedAppointment.startTime as string),
        endTime:
          editedAppointment.endTime instanceof Date
            ? editedAppointment.endTime
            : new Date(editedAppointment.endTime as string),
      } as Appointment;

      const result = await upsertAppointment(updatedAppointment);

      if (result) {
        toast.success("Appointment updated successfully");

        if (onAppointmentUpdate) {
          onAppointmentUpdate(updatedAppointment);
        }

        // Update local state
        setEvents(
          events.map((event) => {
            if (event.resource.id === updatedAppointment.id) {
              return {
                title: updatedAppointment.purpose,
                start: parseDate(updatedAppointment.startTime),
                end: parseDate(updatedAppointment.endTime),
                resource: {
                  status: updatedAppointment.status,
                  notes: updatedAppointment.notes,
                  contactId: updatedAppointment.contactId,
                  id: updatedAppointment.id,
                },
              };
            }
            return event;
          })
        );

        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error("Failed to update appointment");
    }
  };

  const handleStatusUpdate = async (
    newStatus: "scheduled" | "completed" | "canceled"
  ) => {
    try {
      if (!selectedEvent) return;

      // Update the appointment with the new status
      const appointmentToUpdate = appointments.find(
        (app) => app.id === selectedEvent.resource.id
      );

      if (!appointmentToUpdate) return;

      const updatedAppointment = {
        ...appointmentToUpdate,
        status: newStatus,
      };

      const result = await upsertAppointment(updatedAppointment);

      if (result) {
        toast.success(
          `Appointment ${
            newStatus === "canceled" ? "canceled" : "marked as complete"
          } successfully`
        );

        // Update local state
        setEvents(
          events.map((event) => {
            if (event.resource.id === updatedAppointment.id) {
              return {
                ...event,
                resource: {
                  ...event.resource,
                  status: newStatus,
                },
              };
            }
            return event;
          })
        );

        if (onAppointmentUpdate) {
          onAppointmentUpdate(updatedAppointment);
        }

        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error(`Failed to update appointment status:`, error);
      toast.error(`Failed to update appointment status`);
    }
  };

  return (
    <>
      <style>{calendarStyles}</style>
      <div className="h-[800px] p-4">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={["month", "week", "day"]}
          onSelectEvent={handleEventClick}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          selectable
          // Add timezone property to ensure consistent display
          timezone="local"
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

      {/* Appointment Details/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Appointment" : "Appointment Details"}
            </DialogTitle>
          </DialogHeader>
          {editedAppointment?.status === "scheduled" && !isEditMode && (
            <div className="flex gap-2 justify-end w-full ">
              <Button
                variant="outline"
                className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                size="sm"
                onClick={() => handleStatusUpdate("canceled")}
              >
                <X />
              </Button>
              <Button
                variant="outline"
                className="border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                size="sm"
                onClick={() => handleStatusUpdate("completed")}
              >
                <Check />
              </Button>
            </div>
          )}
          {selectedEvent && (
            <div className="space-y-4">
              {isEditMode ? (
                // Edit Mode
                <>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input
                      id="purpose"
                      name="purpose"
                      value={editedAppointment.purpose || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <Input
                          id="startTime"
                          name="startTime"
                          type="datetime-local"
                          value={formatDateForInput(
                            new Date(
                              editedAppointment.startTime || selectedEvent.start
                            )
                          )}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <Input
                          id="endTime"
                          name="endTime"
                          type="datetime-local"
                          value={formatDateForInput(
                            new Date(
                              editedAppointment.endTime || selectedEvent.end
                            )
                          )}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={
                        editedAppointment.status ||
                        selectedEvent.resource.status
                      }
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={editedAppointment.notes || ""}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                // View Mode
                <>
                  <div>
                    <h3 className="font-medium text-lg">
                      {selectedEvent.title}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        {moment(selectedEvent.start).format(
                          "MMM D, YYYY h:mm A"
                        )}{" "}
                        - {moment(selectedEvent.end).format("h:mm A")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedEvent.resource.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : selectedEvent.resource.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedEvent.resource.status.charAt(0).toUpperCase() +
                        selectedEvent.resource.status.slice(1)}
                    </span>
                  </div>

                  {selectedEvent.resource.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">
                        Notes
                      </h4>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedEvent.resource.notes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </>
            ) : (
              <div className="w-full flex flex-wrap gap-2 justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAppointment}
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEditToggle}
                    size="sm"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
