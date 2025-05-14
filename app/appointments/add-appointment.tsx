"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateLocal } from "@/lib/utils";
import { upsertAppointment } from "@/server/actions/appointments";
import { Appointment, AppointmentSchema } from "@/types/appointment-schema";
import { Contact } from "@/types/contact-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AddAppointmentProps {
  handleClose: () => void;
  appointment?: Appointment;
  contacts: Contact[];
  userId: string;
  id?: string;
  contactToAppoint?: Contact;
}
export default function AddAppointment({
  handleClose,
  appointment,
  contacts,
  userId,
  contactToAppoint,
}: AddAppointmentProps) {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const methods = useForm({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      ...(appointment ? { id: appointment.id } : {}),
      contactId: contactToAppoint?.id || appointment?.contactId || "",
      purpose: appointment?.purpose || "",
      startTime: appointment?.startTime || now,
      endTime: appointment?.endTime || oneHourLater,
      notes: appointment?.notes || "",
      status: appointment?.status || "scheduled",
      userId: userId,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = methods;

  useEffect(() => {
    if (contactToAppoint) {
      // Explicitly set both the Select value and form value
      setValue("contactId", contactToAppoint.id, { shouldValidate: true });
    }
  }, [contactToAppoint, setValue]);
  const { execute, status } = useAction(upsertAppointment, {
    onSuccess() {
      console.log("the onsucess callback is working");
      toast.success(
        `${appointment?.id ? "Modification" : "Ajout"} avec success`
      );
      console.log("this is the handle close function", handleClose);
      handleClose?.();
    },
    onError(error) {
      toast.error("Une erreur est survenue", {
        description: error.serverError || error.validationErrors?.join(", "),
      });
    },
  });
  async function onSubmit(values: Appointment) {
    // Here you would typically send the data to your API
    console.log("these are the values", values);
    execute(values);
  }
  useEffect(() => {
    console.log("Form errors:", errors);
  }, [errors]);
  console.log("this is the contact to be appointed", contactToAppoint);
  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  disabled={!!contactToAppoint}
                  value={contactToAppoint?.id || field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact">
                        {/* Display name when value is set */}
                        {contactToAppoint
                          ? `${contactToAppoint.firstName} ${contactToAppoint.lastName}`
                          : field.value
                          ? contacts.find((c) => c.id === field.value)
                              ?.firstName +
                            " " +
                            contacts.find((c) => c.id === field.value)?.lastName
                          : "Select contact"}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                <FormDescription className="min-w-screen">
                  {contactToAppoint
                    ? "The contact has already been selected"
                    : ""}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={formatDateLocal(field.value)}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={formatDateLocal(field.value)}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Input placeholder="Enter meeting purpose" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Add meeting notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className={`${status === "executing" ? "animate-pulse" : ""}`}
          >
            Create Appointment
          </Button>
        </div>
      </form>
    </Form>
  );
}
