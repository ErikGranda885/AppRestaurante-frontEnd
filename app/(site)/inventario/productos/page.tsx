"use client";
import React, { useState, useEffect } from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { GeneralDialog } from "@/components/shared/dialogGen";
import { FormProducts } from "@/components/shared/products-comp/createProductForm";
import { BulkUploadProductDialog } from "@/components/shared/products-comp/cargaProducts";
import { EditProductForm } from "@/components/shared/products-comp/editProductForm";
import { MetricCard } from "@/components/shared/products-comp/componentes/page/metricCard";
import { CategoryCombobox } from "@/components/shared/products-comp/componentes/page/categoryCombobox";
import { StatusTabs } from "@/components/shared/products-comp/componentes/page/statusTabs";
import { CheckCircle, Upload, XCircle } from "lucide-react";
import { ProductCard } from "@/components/shared/products-comp/componentes/page/productCard";
import { Paginator } from "@/components/shared/products-comp/componentes/page/paginator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interfaces y tipos
type MetricFilter = "all" | "critical" | "soonExpire" | "outOfStock";

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

export type Option = {
  value: string;
  label: string;
};

// Helpers de fechas (puedes moverlos a un archivo util)
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
  return isNaN(date.getTime()) ? null : date;
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

// Umbrales
const stockCritico = 10;
const diasCaducidad = 10;

// Opciones de ordenamiento para el dropdown
const sortOptions = [
  { key: "alphabetical", label: "Alfabético (A-Z)" },
  { key: "stockAsc", label: "Menor stock a mayor stock" },
  { key: "expirationAsc", label: "Por días hasta vencimiento" },
  { key: "priceAsc", label: "Precio de menor a mayor" },
];

export default function Page() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  // Se muestran 9 productos por página (3 columnas x 3 filas)
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // statusFilter puede ser "Activo", "Inactivo" o "all"
  const [statusFilter, setStatusFilter] = useState<string>("Activo");
  const [metricFilter, setMetricFilter] = useState<MetricFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<string>("default");
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  // Estados para los diálogos de confirmación
  const [productToDeactivate, setProductToDeactivate] =
    useState<Product | null>(null);
  const [productToActivate, setProductToActivate] = useState<Product | null>(
    null,
  );

  // Cargar categorías
  useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
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

  // Cargar productos
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:5000/productos");
        if (!response.ok) throw new Error("Error al cargar productos");
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

  // Filtros
  let filteredProducts = allProducts;
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.cate_prod.id_cate === parseInt(selectedCategory),
    );
  }

  if (metricFilter === "critical") {
    filteredProducts = filteredProducts.filter(
      (product) => product.stock_prod <= stockCritico && product.stock_prod > 0,
    );
  } else if (metricFilter === "soonExpire") {
    filteredProducts = filteredProducts.filter((product) => {
      const days = getDaysUntilExpiration(product.fech_ven_prod);
      return days !== null && days <= diasCaducidad;
    });
  } else if (metricFilter === "outOfStock") {
    filteredProducts = filteredProducts.filter(
      (product) => product.stock_prod === 0,
    );
  }

  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      product.nom_prod.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  if (statusFilter !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) => product.est_prod === statusFilter,
    );
  }

  // Ordenar según el criterio seleccionado
  if (sortCriteria === "alphabetical") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      a.nom_prod.localeCompare(b.nom_prod),
    );
  } else if (sortCriteria === "stockAsc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.stock_prod - b.stock_prod,
    );
  } else if (sortCriteria === "expirationAsc") {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const daysA = getDaysUntilExpiration(a.fech_ven_prod) ?? 0;
      const daysB = getDaysUntilExpiration(b.fech_ven_prod) ?? 0;
      return daysA - daysB;
    });
  } else if (sortCriteria === "priceAsc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.prec_prod - b.prec_prod,
    );
  } else {
    // Orden predeterminada: si statusFilter es "all", se ordena para que activos aparezcan primero
    if (statusFilter === "all") {
      filteredProducts = [...filteredProducts].sort((a, b) => {
        if (a.est_prod === "Activo" && b.est_prod !== "Activo") return -1;
        if (a.est_prod !== "Activo" && b.est_prod === "Activo") return 1;
        return 0;
      });
    }
  }

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // Al dar click en "Productos Registrados", se muestran todos (activos e inactivos)
  const handleMetricFilter = (filter: MetricFilter) => {
    setMetricFilter(filter);
    setCurrentPage(1);
    if (filter === "all") {
      setStatusFilter("all");
    }
  };

  // Función que se ejecuta cuando se confirma la inactivación
  const confirmDeactivate = async () => {
    if (!productToDeactivate) return;
    try {
      const response = await fetch(
        `http://localhost:5000/productos/inactivar/${productToDeactivate.id_prod}`,
        { method: "PUT" },
      );
      if (!response.ok) throw new Error("Error al inactivar el producto");

      setAllProducts((prev) =>
        prev.map((p) =>
          p.id_prod === productToDeactivate.id_prod
            ? { ...p, est_prod: "Inactivo" }
            : p,
        ),
      );
      toast.custom(
        (t) => (
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
                Producto inactivado exitosamente.
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
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } relative flex w-96 items-start gap-3 rounded-lg border border-red-500 bg-red-100 p-4 shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <XCircle className="mt-1 h-6 w-6 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Error</p>
              <p className="text-sm text-red-600/80">
                Hubo un error al realizar la acción.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-red-500/20">
              <div className="progress-bar h-full bg-red-500" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" },
      );
    } finally {
      setProductToDeactivate(null);
    }
  };

  // Función que se ejecuta cuando se confirma la activación
  const confirmActivate = async () => {
    if (!productToActivate) return;
    try {
      const response = await fetch(
        `http://localhost:5000/productos/activar/${productToActivate.id_prod}`,
        { method: "PUT" },
      );
      if (!response.ok) throw new Error("Error al activar el producto");

      setAllProducts((prev) =>
        prev.map((p) =>
          p.id_prod === productToActivate.id_prod
            ? { ...p, est_prod: "Activo" }
            : p,
        ),
      );
      toast.custom(
        (t) => (
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
                Producto activado exitosamente.
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
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } relative flex w-96 items-start gap-3 rounded-lg border border-red-500 bg-red-100 p-4 shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <XCircle className="mt-1 h-6 w-6 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Error</p>
              <p className="text-sm text-red-600/80">
                Hubo un error al realizar la acción.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-red-500/20">
              <div className="progress-bar h-full bg-red-500" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" },
      );
    } finally {
      setProductToActivate(null);
    }
  };

  return (
    <>
      <ModulePageLayout
        breadcrumbLinkTitle="Inventario"
        breadcrumbPageTitle="Gestión de Productos"
        submenu={true}
        isLoading={false}
      >
        <div className="p-6">
          {/* Tarjetas de métricas */}
          {/* Tarjetas de métricas actualizadas con Productos Agotados */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <MetricCard
              titulo="Productos Registrados"
              valor={allProducts.length}
              porcentaje=""
              periodo="Total"
              iconColor="text-blue-400"
              badgeColorClass="bg-blue-100 dark:bg-blue-800/30 text-blue-500 dark:text-blue-400"
              customRightContent={
                <div className="flex flex-col gap-1 text-right text-xs">
                  <div className="flex items-center justify-end gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    <span>
                      Activos:{" "}
                      <strong>
                        {
                          allProducts.filter((p) => p.est_prod === "Activo")
                            .length
                        }
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                    <span>
                      Inactivos:{" "}
                      <strong>
                        {
                          allProducts.filter((p) => p.est_prod === "Inactivo")
                            .length
                        }
                      </strong>
                    </span>
                  </div>
                </div>
              }
              onClick={() => {
                handleMetricFilter("all");
                setStatusFilter("all");
              }}
            />

            <MetricCard
              titulo="Stock Crítico"
              valor={
                allProducts.filter(
                  (product) =>
                    product.stock_prod <= stockCritico &&
                    product.stock_prod > 0,
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
              onClick={() => {
                setMetricFilter("critical");
                setCurrentPage(1);
                setStatusFilter("Activo");
              }}
            />

            <MetricCard
              titulo="Próx. a Caducar"
              valor={
                allProducts.filter((product) => {
                  const days = getDaysUntilExpiration(product.fech_ven_prod);
                  return days !== null && days <= diasCaducidad;
                }).length
              }
              porcentaje=""
              periodo={
                <>
                  Productos caducados o que caducan en{" "}
                  <span className="font-bold">{diasCaducidad}</span> días o
                  menos
                </>
              }
              iconColor="text-pink-400"
              badgeColorClass="bg-pink-100 dark:bg-pink-800/30 text-pink-500 dark:text-pink-400"
              onClick={() => handleMetricFilter("soonExpire")}
            />

            <MetricCard
              titulo="Productos Agotados"
              valor={allProducts.filter((p) => p.stock_prod === 0).length}
              porcentaje=""
              periodo="Sin stock - Reposición inmediata"
              iconColor="text-red-500"
              badgeColorClass="bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400"
              onClick={() => {
                setMetricFilter("outOfStock");
                setStatusFilter("Activo");
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="rounded-xl border border-border p-6 shadow-md dark:bg-[#292c2d]">
            {/* Filtros y acciones */}
            <div className="flex flex-row justify-between pb-5">
              <div className="flex items-center gap-2">
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
                <label className="text-sm text-secondary-foreground">
                  Categoría:
                </label>
                <CategoryCombobox
                  options={categoryOptions}
                  value={selectedCategory}
                  onValueChange={handleCategorySelect}
                />
                <label className="text-sm text-secondary-foreground">
                  Estado:
                </label>
                <StatusTabs
                  value={statusFilter}
                  onValueChange={(newValue) => {
                    setStatusFilter(newValue);
                    setCurrentPage(1);
                  }}
                />
                <label className="text-sm text-secondary-foreground">
                  Ordenar por:
                </label>
                <SortDropdown
                  onSelect={(key) => {
                    setSortCriteria(key);
                    setCurrentPage(1);
                  }}
                />
              </div>
              {/* Diálogo de carga masiva */}
              {openBulkUpload && (
                <BulkUploadProductDialog
                  onSuccess={(newProducts: Product[]) => {
                    setAllProducts((prev) => [...prev, ...newProducts]);
                    setOpenBulkUpload(false);
                  }}
                  onClose={() => setOpenBulkUpload(false)}
                  categoryOptions={[]}
                />
              )}
              <div className="flex">
                <Button
                  className="mr-4"
                  onClick={() => setOpenBulkUpload(true)}
                >
                  <Upload className="mr-2 h-4 w-4" /> Importar
                </Button>
                <GeneralDialog
                  open={openCreate}
                  onOpenChange={setOpenCreate}
                  triggerText={<>Nuevo Producto</>}
                  title="Crear Nuevo Producto"
                  description="Ingresa la información para crear un nuevo producto."
                  submitText="Crear Producto"
                >
                  <FormProducts
                    onSuccess={(data: any) => {
                      setAllProducts((prev) => [...prev, data.producto]);
                      setOpenCreate(false);
                    }}
                  />
                </GeneralDialog>
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
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product.id_prod}
                      product={product}
                      onEdit={(prod) => setEditProduct(prod)}
                      onActivate={(prod) => {
                        // Abrir diálogo de confirmación para activar
                        setProductToActivate(prod);
                      }}
                      onDeactivate={(prod) => {
                        // Abrir diálogo de confirmación para inactivar
                        setProductToDeactivate(prod);
                      }}
                    />
                  ))}
                  {/* Placeholders para completar 3 columnas en la última fila */}
                  {Array.from({
                    length: (3 - (currentProducts.length % 3)) % 3,
                  }).map((_, idx) => (
                    <div key={`placeholder-${idx}`} className="invisible" />
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

      {/* Diálogo de edición */}
      {editProduct && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setEditProduct(null);
          }}
        >
          <DialogContent className="border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Modifica la información del producto.
              </DialogDescription>
            </DialogHeader>
            <EditProductForm
              initialData={{
                id: editProduct.id_prod.toString(),
                nom_prod: editProduct.nom_prod,
                prec_prod: editProduct.prec_prod,
                stock_prod: editProduct.stock_prod,
                // Se espera que "categoria" sea un número (ID de la categoría)
                categoria: editProduct.cate_prod.id_cate,
                // Convertir el string "dd/MM/yyyy" a Date
                fech_ven_prod: (() => {
                  const parts = editProduct.fech_ven_prod.split("/");
                  if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    return new Date(year, month, day);
                  }
                  return new Date();
                })(),
                img_prod: editProduct.img_prod,
              }}
              categoryOptions={categoryOptions.filter(
                (opt) => opt.value !== "",
              )}
              onSuccess={(data) => {
                const updatedProduct = data.producto;
                const categoryObj = categoryOptions.find(
                  (opt) => opt.value === updatedProduct.cate_prod.toString(),
                );
                const updatedProductWithCategory = {
                  ...updatedProduct,
                  cate_prod: {
                    id_cate: Number(updatedProduct.cate_prod),
                    nom_cate: categoryObj ? categoryObj.label : "",
                  },
                };

                setAllProducts((prev) =>
                  prev.map((p) =>
                    p.id_prod.toString() === updatedProduct.id_prod.toString()
                      ? updatedProductWithCategory
                      : p,
                  ),
                );
                setEditProduct(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmación para inactivar producto */}
      {productToDeactivate && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setProductToDeactivate(null);
          }}
        >
          <DialogContent className="border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Inactivación</DialogTitle>
              <DialogDescription>
                ¿Está seguro de inactivar el producto "
                {productToDeactivate.nom_prod}"?
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setProductToDeactivate(null)}
              >
                No
              </Button>
              <Button onClick={confirmDeactivate}>Sí</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmación para activar producto */}
      {productToActivate && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setProductToActivate(null);
          }}
        >
          <DialogContent className="border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Activación</DialogTitle>
              <DialogDescription>
                ¿Está seguro de activar el producto "
                {productToActivate.nom_prod}"?
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setProductToActivate(null)}
              >
                No
              </Button>
              <Button onClick={confirmActivate}>Sí</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Toaster position="top-right" />
    </>
  );
}

// Componente para ordenar mediante Dropdown Menu
function SortDropdown({ onSelect }: { onSelect: (key: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          ...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Ordenar por:</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onSelect("none")}>
            Quitar filtro
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSelect("alphabetical")}>
            Alfabético (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSelect("stockAsc")}>
            Menor stock a mayor stock
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSelect("expirationAsc")}>
            Por días hasta vencimiento
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSelect("priceAsc")}>
            Precio de menor a mayor
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
