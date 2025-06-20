"use client";
import React, { useState, useEffect, useMemo } from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { FormProducts } from "@/components/shared/productos/formularios/createProductForm";
import { BulkUploadProductDialog } from "@/components/shared/productos/formularios/cargaProducts";
import { EditProductForm } from "@/components/shared/productos/formularios/editProductForm";
import { MetricCard } from "@/components/shared/varios/metricCard";
import { CategoryCombobox } from "@/components/shared/productos/ui/categoryCombobox";
import {
  CloudDownload,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { ProductCard } from "@/components/shared/productos/ui/productCard";
import { Paginator } from "@/components/shared/productos/ui/paginator";
import { Separator } from "@/components/ui/separator";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ICategory, IProduct, IProductEdit } from "@/lib/types";
import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import {
  ModalModEstado,
  TipoAccion,
} from "@/components/shared/Modales/modalModEstado";
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
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { useExportarReporteProductos } from "@/hooks/productos/useExportarReporteProductos";
import { DialogExportarProductos } from "@/components/shared/productos/ui/dialogExportarProductos";
import { useProductosConStock } from "@/hooks/productos/useProductosConStock";
import { useCategorias } from "@/hooks/categorias/useCategorias";
import Preloader from "@/components/shared/varios/preloader";

// Tipos y constantes globales
export type Opcion = {
  value: string;
  label: string;
};

type FiltroMetrica = "all" | "critical" | "outOfStock";

const stockCritico = 10;
const diasCaducidad = 10;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Funciones para filtrar y ordenar productos
function filtrarProductos(
  productos: IProduct[],
  {
    categoriaSeleccionada,
    filtroMetrica,
    consultaBusqueda,
    filtroEstado,
  }: {
    categoriaSeleccionada: string;
    filtroMetrica: FiltroMetrica;
    consultaBusqueda: string;
    filtroEstado: string;
  },
): IProduct[] {
  let filtrados = [...productos];
  if (categoriaSeleccionada) {
    filtrados = filtrados.filter(
      (producto) =>
        producto.cate_prod?.id_cate === parseInt(categoriaSeleccionada),
    );
  }
  if (filtroMetrica === "critical") {
    filtrados = filtrados.filter(
      (producto) =>
        producto.stock_prod <= stockCritico && producto.stock_prod > 0,
    );
  } else if (filtroMetrica === "outOfStock") {
    filtrados = filtrados.filter((producto) => producto.stock_prod === 0);
  }
  if (consultaBusqueda) {
    filtrados = filtrados.filter((producto) =>
      producto.nom_prod.toLowerCase().includes(consultaBusqueda.toLowerCase()),
    );
  }
  if (filtroEstado !== "all") {
    filtrados = filtrados.filter(
      (producto) => producto.est_prod === filtroEstado,
    );
  }
  return filtrados;
}

function ordenarProductos(
  productos: IProduct[],
  criterioOrden: string,
): IProduct[] {
  let ordenados = [...productos];
  if (criterioOrden === "alphabetical") {
    ordenados.sort((a, b) => a.nom_prod.localeCompare(b.nom_prod));
  } else if (criterioOrden === "stockAsc") {
    ordenados.sort((a, b) => a.stock_prod - b.stock_prod);
  } else if (criterioOrden === "priceAsc") {
    // Aquí se puede implementar la lógica para ordenar por precio si es necesario
  } else if (criterioOrden === "none") {
    // Ordenamiento por defecto: mantener los productos "Activos" primero
    ordenados.sort((a, b) => {
      if (a.est_prod === "Activo" && b.est_prod !== "Activo") return -1;
      if (a.est_prod !== "Activo" && b.est_prod === "Activo") return 1;
      return 0;
    });
  }
  return ordenados;
}

export default function PaginaProductos() {
  const [abrirDialogExportar, setAbrirDialogExportar] = useState(false);
  const [soloInsumos, setSoloInsumos] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  // Estados y hooks de la aplicación
  const exportarReporte = useExportarReporteProductos();
  const [paginaActual, setPaginaActual] = useState(1);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Activo");
  const [filtroMetrica, setFiltroMetrica] = useState<FiltroMetrica>("all");
  const [consultaBusqueda, setConsultaBusqueda] = useState("");
  const [criterioOrden, setCriterioOrden] = useState("none");
  const [abrirCargaMasiva, setAbrirCargaMasiva] = useState(false);
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [productoEditar, setProductoEditar] = useState<IProductEdit | null>(
    null,
  );
  // Estado único para mostrar el diálogo de confirmación (ya sea para activar o inactivar)
  const [productoAccion, setProductoAccion] = useState<{
    id_prod: number;
    nom_prod: string;
    tipo: TipoAccion;
  } | null>(null);

  useProtectedRoute();
  const {
    categorias: opcionesCategorias,
    isLoading: cargandoCategorias,
    refetch: refetchCategorias,
  } = useCategorias();

  const { todosLosProductos, cargando, error, refetch } =
    useProductosConStock();

  // Aplicar filtros y ordenamiento
  const productosFiltrados = useMemo(() => {
    let filtrados = filtrarProductos(todosLosProductos, {
      categoriaSeleccionada,
      filtroMetrica,
      consultaBusqueda,
      filtroEstado,
    });

    if (soloInsumos) {
      filtrados = filtrados.filter((prod) => prod.tip_prod === "Insumo");
    }

    return ordenarProductos(filtrados, criterioOrden);
  }, [
    todosLosProductos,
    categoriaSeleccionada,
    filtroMetrica,
    consultaBusqueda,
    filtroEstado,
    criterioOrden,
    soloInsumos,
  ]);

  // Paginación
  const itemsPorPagina = 6;
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
  const productosPaginaActual = productosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400); // puedes ajustar este valor si deseas

    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const manejarSeleccionCategoria = (valor: string) => {
    setSoloInsumos(false); // 🧠
    setCategoriaSeleccionada(valor);
    setPaginaActual(1);
  };

  const manejarFiltroMetrica = (filtro: FiltroMetrica) => {
    setFiltroMetrica(filtro);
    setPaginaActual(1);
    if (filtro === "all") {
      setFiltroEstado("all");
    }
  };

  // Función general para confirmar la acción (activar o inactivar)
  const confirmarAccion = async () => {
    if (!productoAccion) return;

    const startTime = performance.now(); // ⏱️ Inicio

    try {
      let mensaje = "";

      if (productoAccion.tipo === "inactivar") {
        const respuesta = await fetch(
          SERVICIOS_PRODUCTOS.inactivarProducto(productoAccion.id_prod),
          { method: "PUT" },
        );
        if (!respuesta.ok) throw new Error("Error al inactivar el producto");
        mensaje = "Producto inactivado exitosamente";
      } else {
        const respuesta = await fetch(
          SERVICIOS_PRODUCTOS.activarProducto(productoAccion.id_prod),
          { method: "PUT" },
        );
        if (!respuesta.ok) throw new Error("Error al activar el producto");
        mensaje = "Producto activado exitosamente";
      }

      refetch();

      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      ToastSuccess({ message: `${mensaje} en ${duration} segundos.` });
    } catch (error) {
      ToastError({ message: "Hubo un error al procesar la acción." });
    } finally {
      setProductoAccion(null);
    }
  };

  if (showLoader) return <Preloader />;

  return (
    <>
      <ModulePageLayout
        breadcrumbLinkTitle="Productos"
        breadcrumbPageTitle="Gestión de Productos"
        submenu={true}
        isLoading={false}
      >
        <div className="px-6 pt-2">
          <h1 className="text-xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Aquí puedes gestionar los productos de tu negocio.
          </p>
          <div className="pt-2" />
          {/* Sección de acciones y búsqueda */}
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Fila 1 (móvil) */}
            <div className="flex w-full gap-4 sm:flex-row sm:items-center sm:gap-3">
              <GeneralDialog
                open={abrirCrear}
                onOpenChange={setAbrirCrear}
                title="Crear Nuevo Producto"
                description="Ingresa la información para crear un nuevo producto."
                submitText="Crear Producto"
                contentWidth="700px"
                contentHeight="auto"
                triggerText={
                  <>
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="ml-1 sm:hidden">Nuevo producto</span>
                    <span className="ml-1 hidden sm:inline">
                      Añadir nuevo producto
                    </span>
                  </>
                }
              >
                <FormProducts
                  onSuccess={(data: any) => {
                    refetch();
                    setAbrirCrear(false);
                  }}
                />
              </GeneralDialog>
            </div>

            {/* Fila 2 (móvil, o al lado en desktop) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Buscador */}
              <div className="relative flex w-full justify-between sm:w-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar producto"
                  className="w-full border border-border bg-white/10 pl-10 text-[12px] sm:w-[200px]"
                  value={consultaBusqueda}
                  onChange={(e) => {
                    setSoloInsumos(false);
                    setConsultaBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                />
              </div>
              {/* Ordenar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-[40px] border-border text-[12px] font-semibold sm:w-auto"
                    variant="secondary"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 border-border">
                  <DropdownMenuLabel>Ordenar por:</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => {
                        setCriterioOrden("none");
                        setPaginaActual(1);
                      }}
                    >
                      Quitar filtro
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setCriterioOrden("alphabetical");
                        setPaginaActual(1);
                      }}
                    >
                      Alfabético (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setCriterioOrden("stockAsc");
                        setPaginaActual(1);
                      }}
                    >
                      Menor stock a mayor stock
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setCriterioOrden("priceAsc");
                        setPaginaActual(1);
                      }}
                    >
                      Precio de menor a mayor
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Separador visible solo en sm+ */}
              <Separator
                className="hidden h-8 sm:block"
                orientation="vertical"
              />

              {/* Importar */}
              <Button
                className="w-full border-border text-[12px] font-semibold sm:w-auto"
                variant="secondary"
                onClick={() => setAbrirCargaMasiva(true)}
              >
                <Upload className="h-4 w-4" /> Importar
              </Button>

              {/* Exportar */}
              <Button
                className="w-full border-border text-[12px] font-semibold sm:w-auto"
                variant="secondary"
                onClick={() => setAbrirDialogExportar(true)}
              >
                <CloudDownload className="h-4 w-4" /> Exportar
              </Button>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <MetricCard
              titulo="Productos Registrados"
              valor={todosLosProductos.length}
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
                          todosLosProductos.filter(
                            (p: IProduct) => p.est_prod === "Activo",
                          ).length
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
                          todosLosProductos.filter(
                            (p: IProduct) => p.est_prod === "Inactivo",
                          ).length
                        }
                      </strong>
                    </span>
                  </div>
                </div>
              }
              onClick={() => {
                setSoloInsumos(false);
                manejarFiltroMetrica("all");
                setFiltroEstado("all");
              }}
            />

            <MetricCard
              titulo="Stock Crítico"
              valor={
                todosLosProductos.filter(
                  (producto: any) =>
                    producto.stock_prod <= stockCritico &&
                    producto.stock_prod > 0,
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
                setSoloInsumos(false);
                setFiltroMetrica("critical");
                setPaginaActual(1);
                setFiltroEstado("Activo");
              }}
            />

            <MetricCard
              titulo="Productos Agotados"
              valor={
                todosLosProductos.filter((p: IProduct) => p.stock_prod === 0)
                  .length
              }
              porcentaje=""
              periodo="Sin stock - Reposición inmediata"
              iconColor="text-red-500"
              badgeColorClass="bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400"
              onClick={() => {
                setSoloInsumos(false);
                setFiltroMetrica("outOfStock");
                setFiltroEstado("Activo");
                setPaginaActual(1);
              }}
            />

            <MetricCard
              titulo="Productos Insumo"
              valor={
                todosLosProductos.filter(
                  (producto: any) => producto.tip_prod === "Insumo",
                ).length
              }
              porcentaje=""
              periodo="Materias primas o consumibles"
              iconColor="text-indigo-500"
              badgeColorClass="bg-indigo-100 dark:bg-indigo-800/30 text-indigo-500 dark:text-indigo-400"
              onClick={() => {
                setSoloInsumos(true); // ✅ ESTO ES LO QUE FALTABA
                setFiltroEstado("all");
                setFiltroMetrica("all");
                setConsultaBusqueda("");
                setCategoriaSeleccionada("");
                setPaginaActual(1);
              }}
            />
          </div>

          {/* Sección de filtros y listado de productos */}
          <div className="rounded-xl border border-border p-6 shadow-md dark:bg-[#1a1a1a]">
            <div className="flex flex-row justify-between pb-5">
              <div className="flex items-center gap-2">
                <label className="text-sm text-secondary-foreground">
                  Categoría:
                </label>
                <CategoryCombobox
                  options={opcionesCategorias}
                  value={categoriaSeleccionada}
                  onValueChange={manejarSeleccionCategoria}
                />
              </div>
              {abrirCargaMasiva && (
                <BulkUploadProductDialog
                  onSuccess={(nuevosProductos: IProduct[]) => {
                    refetch();
                    setAbrirCargaMasiva(false);
                  }}
                  onClose={() => setAbrirCargaMasiva(false)}
                  categoryOptions={[]}
                />
              )}
            </div>

            {/* Listado de productos */}
            {cargando ? (
              <div className="mt-4 text-center">Cargando productos...</div>
            ) : error ? (
              <div className="text-rojo-500 mt-4 text-center">
                Error: {error}
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="text-gris-500 mt-4 text-center">
                No se encontraron productos para los criterios seleccionados.
              </div>
            ) : (
              <>
                <div className="mt-4 grid h-[245px] grid-cols-1 gap-6 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
                  {productosPaginaActual.map((producto) => (
                    <ProductCard
                      key={producto.id_prod}
                      product={producto}
                      onEdit={(prod) => {
                        const productoParaEditar: IProductEdit = {
                          ...prod,
                          cate_prod:
                            typeof prod.cate_prod === "object"
                              ? (prod.cate_prod?.id_cate ?? 0)
                              : parseInt(prod.cate_prod, 10),
                        };
                        setProductoEditar(productoParaEditar);
                      }}
                      onActivate={(prod) =>
                        setProductoAccion({
                          id_prod: prod.id_prod,
                          nom_prod: prod.nom_prod,
                          tipo: "activar",
                        })
                      }
                      onDeactivate={(prod) =>
                        setProductoAccion({
                          id_prod: prod.id_prod,
                          nom_prod: prod.nom_prod,
                          tipo: "inactivar",
                        })
                      }
                    />
                  ))}
                  {Array.from({
                    length: (3 - (productosPaginaActual.length % 3)) % 3,
                  }).map((_, idx) => (
                    <div key={`placeholder-${idx}`} className="invisible" />
                  ))}
                </div>
                <Paginator
                  currentPage={paginaActual}
                  totalPages={totalPaginas}
                  onPageChange={setPaginaActual}
                />
              </>
            )}
          </div>
        </div>
        <DialogExportarProductos
          open={abrirDialogExportar}
          onOpenChange={setAbrirDialogExportar}
        />
      </ModulePageLayout>

      {/* Diálogo de confirmación general para activar/inactivar */}
      {productoAccion && (
        <ModalModEstado
          abierto={true}
          descripcionPersonalizada={`¿Está seguro de ${
            productoAccion.tipo === "inactivar" ? "inactivar" : "activar"
          } el producto "${productoAccion.nom_prod}"?`}
          onCambioAbierto={(estado: any) =>
            setProductoAccion(estado ? productoAccion : null)
          }
          tipoAccion={productoAccion.tipo}
          nombreElemento={productoAccion.nom_prod}
          onConfirmar={confirmarAccion}
        />
      )}

      {/* Diálogo para editar producto */}
      {productoEditar && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setProductoEditar(null);
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
                id: productoEditar.id_prod.toString(),
                nombre: productoEditar.nom_prod,
                // Si productoEditar.cate_prod es null, se asigna cadena vacía para evitar errores
                categoria: productoEditar.cate_prod
                  ? productoEditar.cate_prod.toString()
                  : "",
                tipo_prod: productoEditar.tip_prod || "",
                undidad_prod: productoEditar.und_prod || "",
                img_prod: productoEditar.img_prod,
              }}
              categoryOptions={opcionesCategorias.filter(
                (opt: any) => opt.value !== "",
              )}
              onSuccess={(data) => {
                const productoActualizado = data.producto;
                const opcionCategoria = opcionesCategorias.find(
                  (opt: any) =>
                    productoActualizado.cate_prod != null &&
                    opt.value === productoActualizado.cate_prod.toString(),
                );
                const productoConCategoria = {
                  ...productoActualizado,
                  cate_prod: {
                    id_cate: Number(productoActualizado.cate_prod),
                    nom_cate: opcionCategoria ? opcionCategoria.label : "",
                  },
                };
                refetch();
                setProductoEditar(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <Toaster position="top-right" />
    </>
  );
}
