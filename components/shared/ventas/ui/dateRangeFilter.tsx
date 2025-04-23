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
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    onChange?.(range);
  };
  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const formatDate = (d: Date) => format(d, "dd MMM yyyy");

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-[12px] font-semibold",
              "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {formatDate(date.from)} - {formatDate(date.to)}
                </>
              ) : isSameDay(date.from, new Date()) ? (
                "Hoy"
              ) : (
                formatDate(date.from)
              )
            ) : (
              <span>Seleccionar un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border border-border p-0"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
