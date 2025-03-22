"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CheckCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import toast from "react-hot-toast";
import { uploadImage } from "@/firebase/subirImage";

// Esquema del formulario
const FormSchema = z.object({
  nom_prod: z
    .string()
    .nonempty("El nombre del producto es requerido")
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  prec_prod: z.coerce
    .number({ required_error: "El precio es requerido" })
    .positive("El precio debe ser mayor a cero"),
  stock_prod: z.coerce
    .number({ required_error: "El stock es requerido" })
    .positive("El stock debe ser mayor a cero"),
  // Se espera que la categoría se envíe como número
  categoria: z.coerce.number({ required_error: "La categoría es requerida" }),
  fech_ven_prod: z.date({
    required_error: "La fecha de vencimiento es requerida",
  }),
});

type FormValues = z.infer<typeof FormSchema>;

// Componente combobox para categorías
export interface CategoryOption {
  value: string;
  label: string;
}

interface CategoryComboboxProps {
  options: CategoryOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

function CategoryCombobox({
  options,
  value,
  onValueChange,
  className,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : "Selecciona categoría"}
          <span className="opacity-50">⌄</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar categoría..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontró categoría.</CommandEmpty>
            <CommandGroup heading="Categorías">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(currentValue) => {
                    const selected = options.find(
                      (o) => o.label === currentValue,
                    );
                    onValueChange(selected?.value || "");
                    setOpen(false);
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Formulario para crear un nuevo producto con diseño en dos columnas
export function FormProducts({
  onSuccess,
}: {
  onSuccess: (data: any) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nom_prod: "",
      prec_prod: 0,
      stock_prod: 0,
      categoria: 0,
      fech_ven_prod: new Date(),
    },
  });

  // Cargar opciones de categoría desde la API
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data: any) => {
        const options: CategoryOption[] = data.categorias.map((cate: any) => ({
          value: cate.id_cate.toString(),
          label: cate.nom_cate,
        }));
        setCategoryOptions(options);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  // Estado para la imagen y su previsualización
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      console.log("Archivo soltado:", file);
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      console.log("URL de previsualización:", preview);
      setImagePreview(preview);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Función de envío del formulario
  const onSubmit = async (data: FormValues) => {
    console.log("Valores del formulario:", data);
    let imageUrl = imagePreview || "";
    if (imageFile) {
      console.log("Subiendo imagen a Firebase...");
      imageUrl = await uploadImage(imageFile);
      console.log("Imagen subida, URL:", imageUrl);
    }

    const payload = {
      nom_prod: data.nom_prod,
      prec_prod: data.prec_prod,
      stock_prod: data.stock_prod,
      cate_prod: data.categoria, // se envía como número
      fech_ven_prod: format(data.fech_ven_prod, "dd/MM/yyyy", { locale: es }),
      img_prod: imageUrl,
      est_prod: "Activo",
    };

    console.log("Payload a enviar:", payload);

    try {
      const response = await fetch("http://localhost:5000/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Error al crear el producto: ${response.status}`);
      }
      const resData = await response.json();
      console.log("Respuesta del servidor:", resData);
      onSuccess(resData);
      form.reset();
      toast.custom(
        (t: any) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } relative flex w-96 items-start gap-3 rounded-lg border border-[#4ADE80] bg-[#F0FFF4] p-4 shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <CheckCircle className="mt-1 h-6 w-6 text-[#166534]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#166534]">
                Mensaje Informativo
              </p>
              <p className="text-sm text-[#166534]/80">
                Producto creado exitosamente.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
              <div className="progress-bar h-full bg-[#4ADE80]" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" },
      );
    } catch (error) {
      console.error("Error al crear el producto:", error);
      toast.error("Error al crear el producto", { duration: 3000 });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto grid max-w-4xl grid-cols-2 gap-8"
      >
        {/* Columna 1: Inputs */}
        <div>
          <FormField
            control={form.control}
            name="nom_prod"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Nombre del Producto
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre del producto"
                    {...field}
                    className={cn(
                      "pr-10 dark:bg-[#09090b]",
                      error
                        ? "border-2 border-red-500"
                        : "dark:border-default-700 dark:border",
                    )}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prec_prod"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Precio
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      field.onChange(isNaN(val) ? 0 : val);
                    }}
                    className={cn(
                      "pr-10 dark:bg-[#09090b]",
                      error
                        ? "border-2 border-red-500"
                        : "dark:border-default-700 dark:border",
                    )}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock_prod"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Stock
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      field.onChange(isNaN(val) ? 0 : val);
                    }}
                    className={cn(
                      "pr-10 dark:bg-[#09090b]",
                      error
                        ? "border-2 border-red-500"
                        : "dark:border-default-700 dark:border",
                    )}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoria"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Categoría
                </FormLabel>
                <FormControl>
                  <CategoryCombobox
                    options={categoryOptions}
                    value={field.value ? field.value.toString() : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                    className={cn(error ? "border-2 border-red-500" : "")}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fech_ven_prod"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-black dark:text-white">
                  Fecha de Vencimiento
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? format(field.value, "dd 'de' MMMM 'de' yyyy", {
                              locale: es,
                            })
                          : "Selecciona fecha"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Ingresa la fecha de vencimiento del producto.
                </FormDescription>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
        </div>
        {/* Columna 2: Zona de imagen */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Imagen del Producto
          </label>
          <div
            onDrop={handleImageDrop}
            onDragOver={handleDragOver}
            className="flex h-64 w-full max-w-md cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4 text-gray-500"
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Previsualización"
                width={200}
                height={200}
                className="object-contain"
              />
            ) : (
              <span>Suelta la imagen aquí</span>
            )}
          </div>
        </div>
        {/* Botón de envío que ocupa ambas columnas */}
        <div className="col-span-2">
          <Button type="submit" className="w-full">
            Crear Producto
          </Button>
        </div>
      </form>
    </Form>
  );
}
