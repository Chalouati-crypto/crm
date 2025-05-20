import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientAccountSchema } from "@/types/account-schema";
import { ContactSchema } from "@/types/contact-schema";
import { ColumnDef } from "@tanstack/react-table";
import {
  Edit,
  Expand,
  MoreHorizontal,
  Plus,
  TestTube,
  Trash,
} from "lucide-react";
import { z } from "zod";

export const columns = (
  handleEdit: (account: z.infer<typeof ClientAccountSchema>) => void,
  handleDelete: (account: z.infer<typeof ClientAccountSchema>) => void,
  handleSubAccount: (account: z.infer<typeof ClientAccountSchema>) => void,
  handleAddContact: (contact: z.infer<typeof ClientAccountSchema>) => void,
  handleAssign: (account: z.infer<typeof ClientAccountSchema>) => void,
  userRole: "admin" | "consultant"
): ColumnDef<typeof ClientAccountSchema>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "parent_account_id",
    header: "Parent Account ID",
  },
  {
    accessorKey: "industry",
    header: "Industry",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const account = row.original;

      if (userRole === "admin")
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
              <DropdownMenuItem onClick={() => handleEdit(account)}>
                <Edit /> Edit account
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleDelete(account);
                }}
              >
                <Trash /> Delete account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSubAccount(account)}>
                <Plus /> Add Sub-Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddContact(account)}>
                <Plus /> Add Contacts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAssign(account)}>
                <TestTube /> Assign consultants
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Expand /> View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    },
  },
];
