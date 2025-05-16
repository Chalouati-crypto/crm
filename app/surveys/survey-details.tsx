"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Calendar,
  User,
  Building2,
  Clock,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Import server actions
import { getContact } from "@/server/actions/contacts";
import { getAccount } from "@/server/actions/accounts";
import { getAppointment } from "@/server/actions/appointments";

export type SurveyBasic = {
  id: string;
  appointmentId: string;
  contactId: string;
  overallRating: number;
  serviceQuality: number;
  suggestions?: string | null;
  completedAt?: string;
};

export default function SurveyDetails({ survey }: { survey: SurveyBasic }) {
  const [details, setDetails] = useState<{
    contact: { firstName: string; lastName: string; accountId: string };
    accountName: string;
    appointment: { startTime: string; endTime?: string; purpose?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        // Call server actions directly
        const contact = await getContact(survey.contactId);
        const account = await getAccount(contact.accountId);
        const appointment = await getAppointment(survey.appointmentId);
        if (!contact || !account || !appointment) return;

        setDetails({
          contact: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            accountId: contact.accountId,
          },
          accountName: account.name,
          appointment: {
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            purpose: appointment.purpose,
          },
        });
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [survey.contactId, survey.appointmentId]);

  const renderStars = (rating: number, size = "w-4 h-4") => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(size, i < rating ? "text-yellow-400" : "text-gray-200")}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);

      // Format date
      const dateOptions: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
      };

      // Format time
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };

      const formattedDate = date.toLocaleDateString(undefined, dateOptions);
      const formattedTime = date.toLocaleTimeString(undefined, timeOptions);

      return {
        date: formattedDate,
        time: formattedTime,
        full: `${formattedDate}, ${formattedTime}`,
      };
    } catch {
      return { date: iso, time: "", full: iso };
    }
  };

  if (loading) {
    return (
      <div className="p-4 grid grid-cols-2 gap-4">
        <Skeleton className="h-8 col-span-2" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (error)
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-1">Unable to load survey details</div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </div>
    );

  if (!details)
    return (
      <div className="p-4 text-center text-muted-foreground">
        No survey details found.
      </div>
    );

  const startTimeFormatted = formatDate(details.appointment.startTime);
  const endTimeFormatted = details.appointment.endTime
    ? formatDate(details.appointment.endTime)
    : null;
  const completedAtFormatted = survey.completedAt
    ? formatDate(survey.completedAt)
    : null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-semibold">Survey Response</h2>
        {completedAtFormatted && (
          <Badge variant="outline" className="text-xs">
            Completed {completedAtFormatted.date}
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Contact and Account Info - Side by side */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Contact</div>
                <div className="text-sm font-medium">
                  {details.contact.firstName} {details.contact.lastName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Account</div>
                <div className="text-sm font-medium">{details.accountName}</div>
              </div>
            </div>
          </div>

          {/* Appointment Date and Time - Side by side */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Date</div>
                <div className="text-sm font-medium">
                  {startTimeFormatted.date}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Time</div>
                <div className="text-sm font-medium">
                  {startTimeFormatted.time}
                  {endTimeFormatted ? ` - ${endTimeFormatted.time}` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Purpose - Full width if exists */}
          {details.appointment.purpose && (
            <div className="mb-3 border-t pt-2">
              <div className="text-xs text-muted-foreground mb-0.5">
                Purpose
              </div>
              <div className="text-sm">{details.appointment.purpose}</div>
            </div>
          )}

          {/* Ratings - Side by side */}
          <div className="grid grid-cols-2 gap-4 border-t pt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-muted-foreground">
                  Overall Rating
                </div>
                <div className="text-xs font-medium">
                  {survey.overallRating}/5
                </div>
              </div>
              {renderStars(survey.overallRating)}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-muted-foreground">
                  Service Quality
                </div>
                <div className="text-xs font-medium">
                  {survey.serviceQuality}/5
                </div>
              </div>
              {renderStars(survey.serviceQuality)}
            </div>
          </div>

          {/* Suggestions - Full width if exists */}
          {survey.suggestions && (
            <div className="mt-3 border-t pt-2">
              <div className="flex items-center gap-1 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Suggestions</div>
              </div>
              <div className="text-sm bg-muted/30 p-2 rounded-md">
                {survey.suggestions}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
