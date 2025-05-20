"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/users-schema";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

export const columns = (
  handleDelete: (user: User) => void,
  handleEdit: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "name",
    header: "name",
  },
  {
    accessorKey: "email",
    header: "email",
  },
  {
    accessorKey: "role",
    header: "role",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
            <DropdownMenuItem onClick={() => handleEdit(user)}>
              <Edit /> Edit user
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(user)}>
              <Trash /> Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
