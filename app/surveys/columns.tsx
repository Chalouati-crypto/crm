"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Survey } from "@/types/survey-schema";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Notebook, Star, Trash } from "lucide-react";

export const columns = (
  handleDelete: (survey: Survey) => void,
  handleViewDetails: (survey: Survey) => void,
  role: string
): ColumnDef<Survey>[] => [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "serviceQuality",
    header: "serviceQuality",
  },
  {
    accessorKey: "overallRating",
    header: "overallRating",
    cell: ({ row }) => {
      const rating = row.getValue("overallRating") as number;
      const stars = Array.from({ length: 5 }, (_, i) => i + 1);

      return (
        <div className="flex gap-0.5">
          {stars.map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= rating ? "text-yellow-400" : "text-gray-300"
              )}
              fill={star <= rating ? "currentColor" : "none"}
            />
          ))}
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const survey = row.original;
      if (role === "consultant") return;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDelete(survey)}>
              <Trash /> Delete Survey
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewDetails(survey)}>
              <Notebook /> View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
