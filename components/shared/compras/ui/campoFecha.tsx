"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface CampoFechaProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
}

export const CampoFecha: React.FC<CampoFechaProps> = ({
  control,
  name,
  label,
  placeholder = "Selecciona una fecha",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal dark:bg-[#222224]",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value
                    ? format(field.value, "dd/MM/yyyy")
                    : placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto border border-border p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  className="dark:bg-[#222224]"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false);
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
