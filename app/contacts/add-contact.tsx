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
import { upsertContact } from "@/server/actions/contacts";
import { ClientAccount } from "@/types/account-schema";
import { Contact, ContactSchema } from "@/types/contact-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AddContactProps {
  handleClose: () => void;
  accounts?: ClientAccount[];
  contact?: Contact;
  id?: string;
  parentAccount?: ClientAccount;
}
export default function AddContact({
  handleClose,
  accounts,
  contact,
  id,
  parentAccount,
}: AddContactProps) {
  const methods = useForm({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      id: contact?.id || "",
      accountId: parentAccount?.id || contact?.accountId || "",
      firstName: contact?.firstName || "",
      lastName: contact?.lastName || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      position: contact?.position || "",
      status: contact?.status || "active",
      createdBy: contact?.createdBy || id,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const { execute, status } = useAction(upsertContact, {
    onSuccess() {
      toast.success(`${contact?.id ? "Modification" : "Ajout"} avec success`);
      handleClose?.();
    },
    onError(error) {
      toast.error("Une erreur est survenue", {
        description: error.serverError || error.validationErrors?.join(", "),
      });
    },
  });
  console.log(handleClose);
  async function onSubmit(values: Contact) {
    // Here you would typically send the data to your API
    console.log(values);
    execute(values);
  }
  useEffect(() => {
    console.log("Form errors:", errors);
  }, [errors]);
  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select
                disabled={!accounts}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts &&
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id!}>
                        {account.name}
                      </SelectItem>
                    ))}
                  {!accounts && (
                    <SelectItem value={contact?.accountId}>
                      {contact?.accountId}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {accounts
                  ? "Select the account this contact belongs to."
                  : "You can't change accounts for a single contact"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter phone number"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter job position"
                  {...field}
                  value={field.value || ""}
                />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Contact</Button>
      </form>
    </Form>
  );
}
