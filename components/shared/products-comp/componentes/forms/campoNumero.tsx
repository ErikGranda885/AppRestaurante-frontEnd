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
  /**
   * Step se utiliza para determinar si se trata de un entero ("1") o decimal (por ejemplo, "0.01").
   */
  step?: string;
  /**
   * Función opcional para parsear el valor ingresado.
   */
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
  // Función de parseo por defecto:
  // Si step es "1", se parsea como entero; de lo contrario, se reemplaza la coma por punto y se parsea como decimal.
  const defaultParse = (val: string) =>
    step === "1" ? parseInt(val, 10) : parseFloat(val.replace(",", "."));
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
              placeholder={placeholder}
              // Mostrar el valor como string (0 se mostrará como "0")
              value={
                field.value !== undefined && field.value !== null
                  ? field.value.toString()
                  : ""
              }
              // Mientras se edita, se actualiza como string
              onChange={(e) => field.onChange(e.target.value)}
              // Al salir del campo, se convierte el valor ingresado a número
              onBlur={() => {
                const num = parseFn(field.value);
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
