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
import { MetricCard } from "@/components/shared/metricCard";
import { CategoryCombobox } from "@/components/shared/products-comp/componentes/page/categoryCombobox";
import { StatusTabs } from "@/components/shared/products-comp/componentes/page/statusTabs";
import {
  CheckCircle,
  CloudDownload,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  XCircle,
} from "lucide-react";
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
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ICategory, IProduct, IProductEdit } from "@/lib/types";
import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { Separator } from "@/components/ui/separator";

export type Option = {
  value: string;
  label: string;
};

type MetricFilter = "all" | "critical" | "soonExpire" | "outOfStock";

// Helpers de fechas (puedes moverlos a un archivo util, por ejemplo, lib/utils/dates.ts)
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
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  // Se muestran 6 productos por página
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Activo");
  const [metricFilter, setMetricFilter] = useState<MetricFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<string>("default");
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<IProductEdit | null>(null);

  const [productToDeactivate, setProductToDeactivate] =
    useState<IProduct | null>(null);
  const [productToActivate, setProductToActivate] = useState<IProduct | null>(
    null,
  );

  useProtectedRoute();

  // Cargar categorías
  useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data: any) => {
        const active = data.categorias.filter(
          (cate: ICategory) => cate.est_cate?.toLowerCase() === "activo",
        );
        const options: Option[] = [
          { value: "", label: "Todos" },
          ...active.map((cate: ICategory) => ({
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
    /* filteredProducts = [...filteredProducts].sort(
      (a, b) => a.prec_prod - b.prec_prod,
    ); */
  } else {
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

  const handleMetricFilter = (filter: MetricFilter) => {
    setMetricFilter(filter);
    setCurrentPage(1);
    if (filter === "all") {
      setStatusFilter("all");
    }
  };

  // Funciones para confirmar inactivación y activación (no se modifican)
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
      ToastSuccess({
        message: "Producto inactivado exitosamente.",
      });
    } catch (error) {
      ToastError({
        message: "Hubo un error al inactivar el producto.",
      });
    } finally {
      setProductToDeactivate(null);
    }
  };

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
      ToastSuccess({
        message: "Producto activado exitosamente.",
      });
    } catch (error) {
      ToastError({
        message: "Hubo un error al activar el producto.",
      });
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
        <div className="px-6 pt-2">
          {/* Tarjetas de métricas */}
          <div className="mb-5 flex items-center justify-between">
            <GeneralDialog
              open={openCreate}
              onOpenChange={setOpenCreate}
              triggerText={
                <>
                  {" "}
                  <Plus className="h-4 w-4 font-light" /> Añade nuevos productos
                </>
              }
              title="Crear Nuevo Producto"
              description="Ingresa la información para crear un nuevo producto."
              submitText="Crear Producto"
              contentWidth="700px"
              contentHeight="auto"
            >
              <FormProducts
                onSuccess={(data: any) => {
                  setAllProducts((prev) => [...prev, data.producto]);
                  setOpenCreate(false);
                }}
              />
            </GeneralDialog>
            <div className="flex items-center gap-3">
              {/* Input para buscar */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar producto..."
                  className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="border-border text-[12px] font-semibold"
                    variant="secondary"
                  >
                    <span className="text-[12px] font-semibold">
                      <SlidersHorizontal className="h-4 w-4" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Ordenar por:</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => {
                        setSortCriteria("none");
                        setCurrentPage(1);
                      }}
                    >
                      Quitar filtro
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setSortCriteria("alphabetical");
                        setCurrentPage(1);
                      }}
                    >
                      Alfabético (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setSortCriteria("stockAsc");
                        setCurrentPage(1);
                      }}
                    >
                      Menor stock a mayor stock
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setSortCriteria("expirationAsc");
                        setCurrentPage(1);
                      }}
                    >
                      Por días hasta vencimiento
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setSortCriteria("priceAsc");
                        setCurrentPage(1);
                      }}
                    >
                      Precio de menor a mayor
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Separator className="h-8" orientation="vertical" />

              <Button
                className="border-border text-[12px] font-semibold"
                variant={"secondary"}
                onClick={() => setOpenBulkUpload(true)}
              >
                <Upload className="h-4 w-4" /> Importar
              </Button>
              {/* Boton para exportar la tabla*/}
              <Button
                className="border-border text-[12px] font-semibold"
                variant={"secondary"}
              >
                <CloudDownload className="h-4 w-4" /> Exportar
              </Button>
            </div>
          </div>
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

          <div className="rounded-xl border border-border p-6 shadow-md dark:bg-[#1a1a1a]">
            {/* Filtros y acciones */}
            <div className="flex flex-row justify-between pb-5">
              <div className="flex items-center gap-2">
                <label className="text-sm text-secondary-foreground">
                  Categoría:
                </label>
                <CategoryCombobox
                  options={categoryOptions}
                  value={selectedCategory}
                  onValueChange={handleCategorySelect}
                />
              </div>
              {/* Diálogo de carga masiva */}
              {openBulkUpload && (
                <BulkUploadProductDialog
                  onSuccess={(newProducts: IProduct[]) => {
                    setAllProducts((prev) => [...prev, ...newProducts]);
                    setOpenBulkUpload(false);
                  }}
                  onClose={() => setOpenBulkUpload(false)}
                  categoryOptions={[]}
                />
              )}
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
                <div className="mt-4 grid h-[210px] grid-cols-1 gap-6 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product.id_prod}
                      product={product}
                      onEdit={(prod) => {
                        // Mapea el producto para que cate_prod sea únicamente el id
                        const productForEdit = {
                          ...prod,
                          cate_prod:
                            typeof prod.cate_prod === "object"
                              ? prod.cate_prod.id_cate
                              : parseInt(prod.cate_prod, 10),
                        };
                        setEditProduct(productForEdit);
                      }}
                      onActivate={(prod) => {
                        setProductToActivate(prod);
                      }}
                      onDeactivate={(prod) => {
                        setProductToDeactivate(prod);
                      }}
                    />
                  ))}
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
          <DialogContent className="w-[700px] max-w-none border-border">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Modifica la información del producto.
              </DialogDescription>
            </DialogHeader>
            <EditProductForm
              initialData={{
                id: editProduct.id_prod.toString(),
                nombre: editProduct.nom_prod,
                categoria: editProduct.cate_prod.toString(),
                tipo_prod: editProduct.tip_prod || "",
                undidad_prod: editProduct.und_prod || "",
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
