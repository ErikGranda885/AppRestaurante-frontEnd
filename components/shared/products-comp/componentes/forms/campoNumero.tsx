import React from "react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface CampoNumeroProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  step?: string;
  parseValue?: (value: string) => number;
}

export const CampoNumero: React.FC<CampoNumeroProps> = ({
  control,
  name,
  label,
  placeholder,
  step = "1",
  parseValue,
}) => {
  const parseFn = parseValue || ((val: string) => parseInt(val, 10));
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel className="text-black dark:text-white">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step={step}
              placeholder={placeholder}
              value={field.value === 0 ? "" : field.value}
              onChange={(e) => {
                const num = parseFn(e.target.value);
                field.onChange(isNaN(num) ? 0 : num);
              }}
              className="dark:border-default-700 dark:border dark:bg-[#09090b]"
            />
          </FormControl>
          <FormMessage className="error-text" />
        </FormItem>
      )}
    />
  );
};
