"use client";
import React, { useState, useEffect } from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { GeneralDialog } from "@/components/shared/dialogGen";
import { FormProducts } from "@/components/shared/products-comp/createProductForm";
import { BulkUploadProductDialog } from "@/components/shared/products-comp/cargaProducts";
import { EditProductForm } from "@/components/shared/products-comp/editProductForm";
import { MetricCard } from "@/components/shared/products-comp/componentes/page/metricCard";
import { CategoryCombobox } from "@/components/shared/products-comp/componentes/page/categoryCombobox";
import { StatusTabs } from "@/components/shared/products-comp/componentes/page/statusTabs";
import { Upload } from "lucide-react";
import { ProductCard } from "@/components/shared/products-comp/componentes/page/productCard";
import { Paginator } from "@/components/shared/products-comp/componentes/page/paginator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interfaces y tipos
type MetricFilter = "all" | "critical" | "soonExpire";

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

// Helper de fechas (puedes moverlos a un archivo util)
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

export default function Page() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [metricFilter, setMetricFilter] = useState<MetricFilter>("all");
  const [statusFilter, setStatusFilter] = useState<string>("Activo");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

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
      (product) => product.stock_prod <= stockCritico,
    );
  } else if (metricFilter === "soonExpire") {
    // Se filtran los productos caducados (días < 0) y los próximos a caducar (0 <= días <= diasCaducidad)
    filteredProducts = filteredProducts.filter((product) => {
      const days = getDaysUntilExpiration(product.fech_ven_prod);
      return days !== null && days <= diasCaducidad;
    });
  }
  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      product.nom_prod.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }
  filteredProducts = filteredProducts.filter(
    (product) => product.est_prod === statusFilter,
  );

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
          </div>
          <div className="rounded-xl border border-border p-6 shadow-md dark:bg-[#09090b]">
            {/* Filtros y acciones */}
            <div className="flex flex-row justify-between pb-5">
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
                <label className="text-sm text-secondary-foreground">
                  Selecciona una categoría:
                </label>
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
                    />
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
          <DialogContent className="sm:max-w-[425px]">
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
                // Reconstruir la categoría usando las opciones disponibles
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
      <Toaster position="top-right" />
    </>
  );
}
