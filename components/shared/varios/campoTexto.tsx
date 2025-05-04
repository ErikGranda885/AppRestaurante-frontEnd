import { Input } from "@/components/ui/input"; // o como se llame tu componente base
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
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel className="text-black dark:text-white ">{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              {...field}
              value={field.value ?? ""}
              placeholder={placeholder}
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
