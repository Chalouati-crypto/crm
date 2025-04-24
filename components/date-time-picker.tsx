"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function DateTimePicker({ control, name, label }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP p")
                  ) : (
                    <span>Pick a date and time</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  if (date) {
                    const newDate = new Date(field.value || new Date());
                    newDate.setFullYear(date.getFullYear());
                    newDate.setMonth(date.getMonth());
                    newDate.setDate(date.getDate());
                    field.onChange(newDate);
                  }
                }}
                initialFocus
              />
              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-50" />
                  <TimePicker
                    date={field.value || new Date()}
                    setDate={(date) => field.onChange(date)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TimePicker({ date, setDate }) {
  const [hour, setHour] = useState(date.getHours().toString().padStart(2, "0"));
  const [minute, setMinute] = useState(
    date.getMinutes().toString().padStart(2, "0")
  );

  useEffect(() => {
    setHour(date.getHours().toString().padStart(2, "0"));
    setMinute(date.getMinutes().toString().padStart(2, "0"));
  }, [date]);

  const handleHourChange = (value) => {
    const newDate = new Date(date);
    newDate.setHours(Number.parseInt(value, 10));
    setDate(newDate);
    setHour(value);
  };

  const handleMinuteChange = (value) => {
    const newDate = new Date(date);
    newDate.setMinutes(Number.parseInt(value, 10));
    setDate(newDate);
    setMinute(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 24 }, (_, i) => i)
            .map((hour) => hour.toString().padStart(2, "0"))
            .map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <span className="text-center">:</span>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, i) => i)
            .map((minute) => minute.toString().padStart(2, "0"))
            .map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
