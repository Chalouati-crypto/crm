"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";

import * as z from "zod";

import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserSchema, updateUserSchema, User } from "@/types/users-schema";
import { omit } from "lodash";
import { createUser, updateUser } from "@/server/actions/users";

export function AddEditUser({
  user,
  handleClose,
}: {
  user?: User | null;
  handleClose: () => void;
}) {
  const isEdit = !!user;
  const { execute, status } = useAction(isEdit ? updateUser : createUser, {
    onSuccess({ data }) {
      if (data?.success) {
        toast.success(isEdit ? "User updated" : "User created");
        handleClose();
      }
    },
  });

  const form = useForm<User>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "", // Never show existing password
      role: user?.role || "consultant",
    },
  });

  const onSubmit = (values: z.infer<typeof createUserSchema>) => {
    // For updates, remove password if empty
    if (isEdit) {
      const payload = values.password ? values : omit(values, ["password"]);
      execute({ id: user.id, ...payload });
    } else {
      execute(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John doe" type="text" />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="name@domaine.com"
                      type="email"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEdit
                      ? "New Password (leave blank to keep current)"
                      : "Password"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={isEdit ? "********" : "••••••••"}
                      type="password"
                      autoComplete="new-password"
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="role"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className={cn(
                " cursor-pointerw-full",
                status === "executing" ? "animate-pulse" : ""
              )}
            >
              {isEdit ? "Update User" : "Create User"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
