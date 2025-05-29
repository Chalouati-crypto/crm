"use client";

import { useState, useEffect } from "react";
import { AppointmentCalendar } from "./appointments-calendar";
import { getAppointments } from "@/server/actions/appointments";
import { getAssignedContacts } from "@/server/actions/contacts";
import { getConsultants } from "@/server/actions/consultants"; // You'll need to create this
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Appointment } from "@/types/appointment-schema";
import { TypographyH2 } from "@/components/ui/heading-2";

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
}

interface Consultant {
  id: string;
  name: string;
  email: string;
}

export function AdminAppointments({ user }: { user: User }) {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch consultants on component mount
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const consultantsData = await getConsultants();
        setConsultants(consultantsData);

        // Set the first consultant as default if available
        if (consultantsData.length > 0) {
          setSelectedConsultantId(consultantsData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch consultants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  // Fetch appointments and contacts when consultant changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedConsultantId) return;

      try {
        setLoading(true);
        const [appointmentsData, contactsData] = await Promise.all([
          getAppointments(selectedConsultantId),
          getAssignedContacts(selectedConsultantId),
        ]);

        setAppointments(appointmentsData);
        setContacts(contactsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedConsultantId]);

  const handleConsultantChange = (consultantId: string) => {
    setSelectedConsultantId(consultantId);
  };

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
  };

  const handleAppointmentDelete = (appointmentId: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
  };

  if (loading && consultants.length === 0) {
    return <div>Loading consultants...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-10 mb-8 mt-7">
        <TypographyH2>Appointments</TypographyH2>
      </div>

      {/* Consultant Selector */}
      <div className="mb-6 max-w-xs">
        <Label htmlFor="consultant-select" className="text-base font-medium">
          Select Consultant
        </Label>
        <Select
          value={selectedConsultantId}
          onValueChange={handleConsultantChange}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose a consultant" />
          </SelectTrigger>
          <SelectContent>
            {consultants.map((consultant) => (
              <SelectItem key={consultant.id} value={consultant.id}>
                {consultant.name || consultant.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar */}
      {selectedConsultantId && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div>Loading appointments...</div>
            </div>
          ) : (
            <AppointmentCalendar
              appointments={appointments}
              onAppointmentUpdate={handleAppointmentUpdate}
              onAppointmentDelete={handleAppointmentDelete}
            />
          )}
        </>
      )}

      {consultants.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No consultants found in the system.
        </div>
      )}
    </div>
  );
}
