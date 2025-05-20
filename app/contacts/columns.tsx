"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveContact } from "@/server/actions/contacts";
import { Contact } from "@/types/contact-schema";
import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Calendar,
  Clipboard,
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

export const columns = (
  handleEdit: (contact: Contact) => void,
  handleDelete: (contact: Contact) => void,
  handleAddAppointment: (contact: Contact) => void,
  userRole: "admin" | "consultant"
): ColumnDef<Contact>[] => [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "firstName",
    header: "firstName",
  },
  {
    accessorKey: "email",
    header: "email",
  },
  {
    accessorKey: "status",
    header: "status",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {userRole === "admin" && (
              <>
                <DropdownMenuItem onClick={() => handleEdit(contact)}>
                  <Edit /> Edit contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(contact)}>
                  <Trash /> Delete contact
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={() => handleAddAppointment(contact)}>
              <Calendar /> Schedule Meeting
            </DropdownMenuItem>
            {userRole === "admin" && (
              <DropdownMenuItem
                onClick={() => archiveContact({ id: contact.id! })}
              >
                <Archive /> Archive Account
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(contact.email);
                toast.success("Email copied to clipboard");
              }}
            >
              <Clipboard /> Copy Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
