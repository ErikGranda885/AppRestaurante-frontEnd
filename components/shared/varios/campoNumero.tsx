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
  parseValue?: (value: string | number) => number;
}

export const CampoNumero: React.FC<CampoNumeroProps> = ({
  control,
  name,
  label,
  placeholder,
  step = "0.01",
  parseValue,
}) => {
  // ✅ Asegura que el valor se trate como string al hacer replace
  const defaultParse = (val: string | number) =>
    step === "1"
      ? parseInt(String(val), 10)
      : parseFloat(String(val).replace(",", "."));

  const parseFn = parseValue || defaultParse;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel className="text-black dark:text-white">{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              inputMode={step === "1" ? "numeric" : "decimal"}
              placeholder={placeholder || (step === "1" ? "0" : "0.00")}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={() => {
                const parsed = parseFn(field.value);
                if (!isNaN(parsed)) {
                  const fixed =
                    step === "1" ? parsed : parseFloat(parsed.toFixed(2));
                  field.onChange(fixed);
                } else {
                  field.onChange(""); // limpia si no es válido
                }
              }}
              className={`${
                error ? "border-2 border-[#f31260]" : ""
              } w-full rounded-md dark:bg-[#222224]`}
            />
          </FormControl>
          <FormMessage className="error-text" />
        </FormItem>
      )}
    />
  );
};
