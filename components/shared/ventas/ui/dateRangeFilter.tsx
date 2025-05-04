"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const formatDate = (d: Date) => format(d, "dd MMM yyyy");

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-[12px] font-semibold dark:bg-[#222224]",
              "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {formatDate(value.from)} - {formatDate(value.to)}
                </>
              ) : isSameDay(value.from, new Date()) ? (
                "Hoy"
              ) : (
                formatDate(value.from)
              )
            ) : (
              <span>Seleccionar un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border border-border p-0 "
          align="start"
        >
          <Calendar
            initialFocus
            className="dark:bg-[#222224]"
            mode="range"
            defaultMonth={value.from}
            selected={value}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange(range); // ✅ solo se envía si el rango está completo
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
