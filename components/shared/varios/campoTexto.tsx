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
  type?: "text" | "email" | "tel" | "number" | "password"; // tipos soportados
  maxLength?: number;
  disabled?: boolean;
}

export const CampoTexto: React.FC<CampoTextoProps> = ({
  control,
  name,
  label,
  placeholder,
  type = "text", // por defecto 'text'
  maxLength,
  disabled,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel className="text-black dark:text-white">{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              value={field.value ?? ""}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              className={`${
                error ? "border-2 border-[#f31260]" : ""
              } w-full rounded-md dark:bg-[#222224]`}
              onKeyDown={(e) => {
                // bloquear letras si el tipo es 'tel' o 'number'
                if (
                  (type === "tel" || type === "number") &&
                  !/[0-9]|Backspace|Tab|ArrowLeft|ArrowRight|Delete/.test(e.key)
                ) {
                  e.preventDefault();
                }
              }}
            />
          </FormControl>
          <FormMessage className="error-text" />
        </FormItem>
      )}
    />
  );
};
