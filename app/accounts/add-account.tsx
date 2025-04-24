"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
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
import { ClientAccountSchema } from "@/types/account-schema";
import { useAction } from "next-safe-action/hooks";
import { upsertClientAccount } from "@/server/actions/accounts";
import { toast } from "sonner";
import { useEffect } from "react";

interface AddAccountProps {
  handleClose: () => void;
  account?: z.infer<typeof ClientAccountSchema>;
  accounts: z.infer<typeof ClientAccountSchema>[];
  accountToExpand?: z.infer<typeof ClientAccountSchema>;
}

export default function AddAccount({
  handleClose,
  account,
  accounts,
  accountToExpand,
}: AddAccountProps) {
  // Sample parent accounts and industries for the demo
  // Replace with your actual data fetching logic

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Media",
    "Transportation",
  ];

  const methods = useForm({
    resolver: zodResolver(ClientAccountSchema),
    defaultValues: {
      id: account?.id || "",
      name: account?.name || "",
      parent_account_id:
        account?.parent_account_id ?? accountToExpand?.id ?? "",
      industry: account?.industry || "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;
  const { execute, status } = useAction(upsertClientAccount, {
    onSuccess() {
      toast.success(`${account?.id ? "Modification" : "Ajout"} avec success`);
      handleClose?.();
    },
    onError(error) {
      toast.error("Une erreur est survenue", {
        description: error.serverError || error.validationErrors?.join(", "),
      });
    },
  });
  useEffect(() => {
    console.log("Form errors:", errors);
  }, [errors]);
  async function onSubmit(values: z.infer<typeof ClientAccountSchema>) {
    // Here you would typically send the data to your API
    console.log(values);
    execute(values);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter account name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="parent_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Account</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value!}
              >
                <FormControl>
                  <SelectTrigger disabled={!!accountToExpand}>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the parent account for this client.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className={`${
            status === "executing" ? "animate-pulse" : ""
          } cursor-pointer`}
          type="submit"
        >
          {account ? "Modifier" : "Ajouter"}
        </Button>
      </form>
    </FormProvider>
  );
}
