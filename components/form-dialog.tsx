"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function FormDialog({
  trigger,
  title,
  children,
  icon,
}: {
  trigger: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader className="flex gap-8">
        <DialogTrigger>
          <a className="px-6 py-3 border rounded-md text-white shadow-xs cursor-pointer border-input bg-accent-foreground ">
            {(icon, trigger)}
          </a>
        </DialogTrigger>
      </DialogHeader>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {React.isValidElement(children) &&
          React.cloneElement(children, { handleClose: () => setOpen(false) })}
      </DialogContent>
    </Dialog>
  );
}
