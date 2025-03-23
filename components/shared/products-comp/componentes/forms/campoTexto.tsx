import React from "react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface CampoTextoProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
}

export const CampoTexto: React.FC<CampoTextoProps> = ({
  control,
  name,
  label,
  placeholder,
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field, fieldState: { error } }) => (
      <FormItem>
        <FormLabel className="text-black dark:text-white">{label}</FormLabel>
        <FormControl>
          <Input
            placeholder={placeholder}
            {...field}
            className="dark:border-default-700 dark:border dark:bg-[#09090b]"
          />
        </FormControl>
        <FormMessage className="error-text" />
      </FormItem>
    )}
  />
);
