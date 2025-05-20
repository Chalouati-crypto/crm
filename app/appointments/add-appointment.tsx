"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { formatDateLocal } from "@/lib/utils";
import { upsertAppointment } from "@/server/actions/appointments";

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

import { Appointment, AppointmentSchema } from "@/types/appointment-schema";
import type { ClientAccountWithContacts } from "@/types/account-schema";
import type { Contact } from "@/types/contact-schema";

interface AddAppointmentProps {
  handleClose: () => void;
  appointment?: Appointment;
  accountsWithContacts: ClientAccountWithContacts[];
  userId: string;
  contactToAppoint?: Contact;
}

export default function AddAppointment({
  handleClose,
  appointment,
  accountsWithContacts,
  userId,
  contactToAppoint,
}: AddAppointmentProps) {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // Determine initial selected account based on contactToAppoint or appointment
  const initialAccountId =
    contactToAppoint?.accountId ||
    accountsWithContacts.find((a) =>
      appointment?.contactId
        ? a.contacts.some((c) => c.id === appointment.contactId)
        : false
    )?.account.id;

  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(
    initialAccountId
  );

  const methods = useForm<Appointment>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      ...(appointment ? { id: appointment.id } : {}),
      contactId: contactToAppoint?.id || appointment?.contactId || "",
      purpose: appointment?.purpose || "",
      startTime: appointment?.startTime || now,
      endTime: appointment?.endTime || oneHourLater,
      notes: appointment?.notes || "",
      status: appointment?.status || "scheduled",
      userId,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = methods;

  useEffect(() => {
    // If a contactToAppoint is passed, ensure we also select its account
    if (contactToAppoint) {
      setSelectedAccount(contactToAppoint.accountId);
      setValue("contactId", contactToAppoint.id, { shouldValidate: true });
    }
  }, [contactToAppoint, setValue]);

  const { execute, status } = useAction(upsertAppointment, {
    onSuccess() {
      toast.success(
        `${appointment?.id ? "Modification" : "Ajout"} avec succès`
      );
      handleClose();
    },
    onError(err) {
      toast.error("Une erreur est survenue", {
        description: err.serverError || err.validationErrors?.join(", "),
      });
    },
  });

  async function onSubmit(values: Appointment) {
    execute(values);
  }

  // Derive contacts for selected account
  const contacts =
    accountsWithContacts.find((a) => a.account.id === selectedAccount)
      ?.contacts || [];

  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Account Select */}
          <FormField
            control={control}
            name="contactId"
            render={() => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <Select
                  value={selectedAccount}
                  onValueChange={(val) => {
                    setSelectedAccount(val);
                    setValue("contactId", "");
                  }}
                  disabled={!!contactToAppoint}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accountsWithContacts.map(({ account }) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {contactToAppoint
                    ? "Account locked to the provided contact"
                    : "Select an account first"}
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Contact Select */}
          <FormField
            control={control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!!contactToAppoint || !selectedAccount}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
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
                <FormDescription>
                  {contactToAppoint
                    ? "The contact has already been selected"
                    : contacts.length > 0
                      ? ""
                      : "No contacts available for this account"}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Start and End Time Fields */}
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

        {/* Purpose Field */}
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

        {/* Notes Field */}
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

        {/* Status Field */}
        {appointment?.id && (
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select {...field}>
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
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className={`${status === "executing" ? "animate-pulse" : ""}`}
          >
            {appointment?.id ? "Update Appointment" : "Create Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
