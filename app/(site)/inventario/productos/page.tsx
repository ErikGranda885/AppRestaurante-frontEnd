"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUpIcon, Upload, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* Umbral para tarjetas */

const stockCritico = 10;
const diasCaducidad = 10;

type MetricFilter = "all" | "critical" | "soonExpire";

/* Componente base */

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  porcentaje: string;
  periodo: React.ReactNode;
  iconColor: string;
  badgeColorClass: string;
  onClick?: () => void;
}

function MetricCard({
  titulo,
  valor,
  porcentaje,
  periodo,
  iconColor,
  badgeColorClass,
  onClick,
}: MetricCardProps) {
  return (
    <Card
      onClick={onClick}
      className="group flex cursor-pointer flex-col justify-between rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:bg-[#09090b]"
    >
      <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CardTitle className="text-sm font-light text-secondary-foreground">
            {titulo}
          </CardTitle>
          <div className="mt-2 flex items-center gap-5">
            <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
              {valor}
            </span>
            <span
              className={`inline-block rounded-md px-2 py-1 text-sm font-bold ${badgeColorClass}`}
            >
              {porcentaje}
            </span>
          </div>
          <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            {periodo}
          </CardDescription>
        </div>
        <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
          <TrendingUpIcon
            className={`h-7 w-7 transition-transform duration-300 group-hover:scale-110 ${iconColor}`}
          />
        </div>
      </CardHeader>
    </Card>
  );
}

/* Fechas para caducados formatos */
const parseDateString = (dateStr: string): Date | null => {
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
  }
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  return null;
};

const resetTime = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDaysUntilExpiration = (
  expirationDateString: string,
): number | null => {
  const expirationDate = parseDateString(expirationDateString);
  if (!expirationDate) return null;
  const today = resetTime(new Date());
  const expDate = resetTime(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/* Interfaces */
interface Category {
  id_cate: number;
  nom_cate: string;
  desc_cate: string;
  est_cate: string;
}

interface Product {
  id_prod: number;
  prec_prod: number;
  stock_prod: number;
  cate_prod: Category;
  nom_prod: string;
  est_prod: string;
  fech_ven_prod: string;
  img_prod: string;
}

interface Option {
  value: string;
  label: string;
}

/* Carta producto */
function ProductCard({ product }: { product: Product }) {
  const daysLeft = getDaysUntilExpiration(product.fech_ven_prod);
  const expirationText =
    daysLeft === null
      ? "Fecha inválida"
      : daysLeft > 0
        ? `Quedan ${daysLeft} día${daysLeft === 1 ? "" : "s"}`
        : daysLeft === 0
          ? "Vence hoy"
          : `Caducado hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) === 1 ? "" : "s"}`;

  let badgeColorClass = "";
  if (daysLeft === null) {
    badgeColorClass = "bg-gray-500 text-white";
  } else if (daysLeft < 0 || daysLeft <= 3) {
    badgeColorClass = "bg-red-500 text-white";
  } else if (daysLeft <= 10) {
    badgeColorClass = "bg-yellow-500 text-white";
  } else {
    badgeColorClass = "bg-green-500 text-white";
  }

  return (
    <Card className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-white shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-2xl dark:bg-[#09090b]">
      <div className="relative h-32 w-full">
        <Image
          src={product.img_prod}
          alt={product.nom_prod}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-3">
        <div className="mb-1 border-b border-gray-200 pb-1">
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {product.nom_prod}
          </CardTitle>
        </div>
        <div className="mb-2">
          <CardDescription className="text-xs text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Categoría:</span>{" "}
            {product.cate_prod.nom_cate}
          </CardDescription>
          <CardDescription className="text-xs text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Stock:</span> {product.stock_prod}
          </CardDescription>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Precio:</span> $
            {product.prec_prod.toFixed(2)}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColorClass}`}
          >
            {expirationText}
          </span>
        </div>
        <div className="mt-1">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Estado:</span>{" "}
            {product.est_prod === "Activo" ? (
              <span className="text-green-500 dark:text-green-300">Activo</span>
            ) : (
              <span className="text-red-500 dark:text-red-300">Inactivo</span>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}

/* Paginator */

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Paginator({ currentPage, totalPages, onPageChange }: PaginatorProps) {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mt-4 flex items-center justify-center space-x-2">
      <Button onClick={handlePrevious} disabled={currentPage === 1}>
        Anterior
      </Button>
      {pages.map((page) => (
        <Button key={page} onClick={() => onPageChange(page)}>
          {page}
        </Button>
      ))}
      <Button onClick={handleNext} disabled={currentPage === totalPages}>
        Siguiente
      </Button>
    </div>
  );
}

/* Combobox categorias */
interface CategoryComboboxProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
}

function CategoryCombobox({
  options,
  value,
  onValueChange,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : "Todos"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] border-border p-0">
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
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* Tabs para estados */
interface StatusTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

function StatusTabs({ value, onValueChange }: StatusTabsProps) {
  return (
    /*  */
    <Tabs
      defaultValue="Activo"
      value={value}
      onValueChange={(newValue) => {
        onValueChange(newValue);
      }}
      className="w-[200px]"
    >
      <TabsList>
        <TabsTrigger value="Activo">Activos</TabsTrigger>
        <TabsTrigger value="Inactivo">Inactivos</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

/* Componente principal */
export default function Page() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Estado para el filtro de métrica
  const [metricFilter, setMetricFilter] = useState<MetricFilter>("all");

  // Estado para el filtro de estado (Activos/Inactivos)
  const [statusFilter, setStatusFilter] = useState<string>("Activo");

  // Estado para el buscador
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cargar categorías desde la API e incluir "Todos"
  useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar categorías");
        }
        return res.json();
      })
      .then((data: any) => {
        const options: Option[] = [
          { value: "", label: "Todos" },
          ...data.categorias.map((cate: Category) => ({
            value: cate.id_cate.toString(),
            label: cate.nom_cate,
          })),
        ];
        setCategoryOptions(options);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  // Cargar productos desde la API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:5000/productos");
        if (!response.ok) {
          throw new Error("Error al cargar productos");
        }
        const data = await response.json();
        setAllProducts(data);
      } catch (err: any) {
        setErrorProducts(err.message);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  let filteredProducts = allProducts;
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.cate_prod.id_cate === parseInt(selectedCategory),
    );
  }
  if (metricFilter === "critical") {
    filteredProducts = filteredProducts.filter(
      (product) => product.stock_prod <= stockCritico,
    );
  } else if (metricFilter === "soonExpire") {
    filteredProducts = filteredProducts.filter((product) => {
      const days = getDaysUntilExpiration(product.fech_ven_prod);
      return days !== null && days >= 0 && days <= diasCaducidad;
    });
  }
  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      product.nom_prod.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }
  // Filtrar por estado
  filteredProducts = filteredProducts.filter(
    (product) => product.est_prod === statusFilter,
  );

  // Paginación sobre productos filtrados
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Actualizar filtro de categoría
  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // Actualizar filtro métrico
  const handleMetricFilter = (filter: MetricFilter) => {
    setMetricFilter(filter);
    setCurrentPage(1);
  };

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Inventario"
      breadcrumbPageTitle="Gestión de Productos"
      submenu={true}
      isLoading={false}
    >
      <div className="p-6">
        {/* Tarjetas de métricas dinámicas */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            titulo="Productos Registrados"
            valor={allProducts.length}
            porcentaje=""
            periodo="Total"
            iconColor="text-green-400"
            badgeColorClass="bg-green-100 dark:bg-green-800/30 text-green-500 dark:text-green-400"
            onClick={() => handleMetricFilter("all")}
          />
          <MetricCard
            titulo="Stock Crítico"
            valor={
              allProducts.filter(
                (product) => product.stock_prod <= stockCritico,
              ).length
            }
            porcentaje=""
            periodo={
              <>
                Productos con stock menor o igual a{" "}
                <span className="font-bold">{stockCritico}</span>
              </>
            }
            iconColor="text-yellow-400"
            badgeColorClass="bg-yellow-100 dark:bg-yellow-800/30 text-yellow-500 dark:text-yellow-400"
            onClick={() => handleMetricFilter("critical")}
          />
          <MetricCard
            titulo="Próx. a Caducar"
            valor={
              allProducts.filter((product) => {
                const days = getDaysUntilExpiration(product.fech_ven_prod);
                return days !== null && days >= 0 && days <= diasCaducidad;
              }).length
            }
            porcentaje=""
            periodo={
              <>
                Productos que caducan en{" "}
                <span className="font-bold">{diasCaducidad}</span> días o menos
              </>
            }
            iconColor="text-pink-400"
            badgeColorClass="bg-pink-100 dark:bg-pink-800/30 text-pink-500 dark:text-pink-400"
            onClick={() => handleMetricFilter("soonExpire")}
          />
        </div>
        <div className="rounded-xl border border-border p-6 shadow-md dark:bg-[#09090b]">
          {/* Filtros y acciones */}
          <div className="flex flex-row justify-between pb-1">
            <div className="flex items-center gap-4">
              <Input
                type="text"
                placeholder="Buscar"
                className="w-[100px]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {/* Label para el combobox de categoria */}
              <label className="text-sm text-secondary-foreground">
                Selecciona una categoría:
              </label>
              {/* Combobox de categorías */}
              <CategoryCombobox
                options={categoryOptions}
                value={selectedCategory}
                onValueChange={handleCategorySelect}
              />
              <label className="text-sm text-secondary-foreground">
                Selecciona un estado:
              </label>
              <StatusTabs
                value={statusFilter}
                onValueChange={(newValue) => {
                  setStatusFilter(newValue);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex">
              <Button className="mr-4">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button>Nuevo Producto</Button>
            </div>
          </div>

          {/* Sección de productos */}
          {loadingProducts ? (
            <div className="mt-4 text-center">Cargando productos...</div>
          ) : errorProducts ? (
            <div className="mt-4 text-center text-red-500">
              Error: {errorProducts}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mt-4 text-center text-gray-500">
              No se encontraron productos para los criterios seleccionados.
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id_prod} product={product} />
                ))}
              </div>
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </ModulePageLayout>
  );
}
