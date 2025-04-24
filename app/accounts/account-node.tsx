"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ClientAccount } from "@/types/account-schema";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Edit,
  Expand,
  FolderKanban,
  MoreHorizontal,
  Plus,
  TestTube,
  Trash,
  Users,
} from "lucide-react";
import { useState } from "react";

export const AccountNode = ({
  account,
  level = 0,
}: {
  account: ClientAccount & {
    children: (ClientAccount & { children: ClientAccount[] })[];
  };
  level?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  return (
    <div className="account-node">
      <div
        className={cn(
          "flex items-center py-2 px-1 rounded-md hover:bg-muted/50 cursor-pointer group",
          level > 0 && "ml-6 relative"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {level > 0 && (
          <div className="absolute left-0 top-0 h-full w-px bg-border -ml-3" />
        )}
        {level > 0 && (
          <div className="absolute left-0 top-1/2 w-3 h-px bg-border -ml-3" />
        )}

        {account.children.length > 0 ? (
          <div className="mr-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="w-5" />
        )}

        {(() => {
          // Choose icon based on level
          switch (true) {
            case level === 0:
              return (
                <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
              );
            case level === 1:
              return (
                <Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
              );
            case level === 2:
              return (
                <FolderKanban className="h-5 w-5 mr-2 text-muted-foreground" />
              );
            default:
              return <Users className="h-5 w-5 mr-2 text-muted-foreground" />;
          }
        })()}
        <div className="flex-1">
          <div className="font-medium">{account.name}</div>
          <div className="text-xs text-muted-foreground">
            {account.industry}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-md hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => console.log("this is the account", account)}
              >
                <Edit /> Edit account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash /> Delete account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus /> Add Sub-Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus /> Add Contacts
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TestTube /> Assign consultants
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Expand /> View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isExpanded && account.children.length > 0 && (
        <div className="children-container">
          {account.children.map((child) => (
            <AccountNode key={child.id} account={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
