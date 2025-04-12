"use client";
import React, { useState, useEffect, useMemo } from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { GeneralDialog } from "@/components/shared/dialogGen";
import { FormProducts } from "@/components/shared/products-comp/createProductForm";
import { BulkUploadProductDialog } from "@/components/shared/products-comp/cargaProducts";
import { EditProductForm } from "@/components/shared/products-comp/editProductForm";
import { MetricCard } from "@/components/shared/metricCard";
import { CategoryCombobox } from "@/components/shared/products-comp/componentes/page/categoryCombobox";
import {
  CloudDownload,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { ProductCard } from "@/components/shared/products-comp/componentes/page/productCard";
import { Paginator } from "@/components/shared/products-comp/componentes/page/paginator";
import { Separator } from "@/components/ui/separator";
import { getDaysUntilExpiration } from "@/utils/dates";

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
import { SERVICIOS } from "@/services/productos.service";

// Tipos y constantes globales
export type Opcion = {
  value: string;
  label: string;
};

type FiltroMetrica = "all" | "critical" | "soonExpire" | "outOfStock";

const stockCritico = 10;
const diasCaducidad = 10;

// Hook para cargar categorías
function useObtenerCategorias() {
  const [opcionesCategorias, setOpcionesCategorias] = useState<Opcion[]>([]);
  useEffect(() => {
    fetch(SERVICIOS.categorias)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data: any) => {
        const activas = data.categorias.filter(
          (cate: ICategory) => cate.est_cate?.toLowerCase() === "activo",
        );
        const opciones: Opcion[] = [
          { value: "", label: "Todos" },
          ...activas.map((cate: ICategory) => ({
            value: cate.id_cate.toString(),
            label: cate.nom_cate,
          })),
        ];
        setOpcionesCategorias(opciones);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);
  return opcionesCategorias;
}

// Hook para cargar productos
function useObtenerProductos() {
  const [todosLosProductos, setTodosLosProductos] = useState<IProduct[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function obtenerProductos() {
      try {
        const respuesta = await fetch(SERVICIOS.productos);
        if (!respuesta.ok) throw new Error("Error al cargar productos");
        const datos = await respuesta.json();
        setTodosLosProductos(datos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    obtenerProductos();
  }, []);

  return { todosLosProductos, cargando, error, setTodosLosProductos };
}

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
  } else if (filtroMetrica === "soonExpire") {
    filtrados = filtrados.filter((producto) => {
      const dias = getDaysUntilExpiration(producto.fech_ven_prod);
      return dias !== null && dias <= diasCaducidad;
    });
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
  } else if (criterioOrden === "expirationAsc") {
    ordenados.sort((a, b) => {
      const diasA = getDaysUntilExpiration(a.fech_ven_prod) ?? 0;
      const diasB = getDaysUntilExpiration(b.fech_ven_prod) ?? 0;
      return diasA - diasB;
    });
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

// Componente principal de la página
export default function PaginaProductos() {
  // Estados y hooks de la aplicación
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
  const opcionesCategorias = useObtenerCategorias();
  const { todosLosProductos, cargando, error, setTodosLosProductos } =
    useObtenerProductos();

  // Aplicar filtros y ordenamiento
  const productosFiltrados = useMemo(() => {
    const filtrados = filtrarProductos(todosLosProductos, {
      categoriaSeleccionada,
      filtroMetrica,
      consultaBusqueda,
      filtroEstado,
    });
    return ordenarProductos(filtrados, criterioOrden);
  }, [
    todosLosProductos,
    categoriaSeleccionada,
    filtroMetrica,
    consultaBusqueda,
    filtroEstado,
    criterioOrden,
  ]);

  // Paginación
  const itemsPorPagina = 6;
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
  const productosPaginaActual = productosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina,
  );

  // Handlers
  const manejarSeleccionCategoria = (valor: string) => {
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
    try {
      if (productoAccion.tipo === "inactivar") {
        const respuesta = await fetch(
          SERVICIOS.inactivarProducto(productoAccion.id_prod),
          { method: "PUT" },
        );
        if (!respuesta.ok) throw new Error("Error al inactivar el producto");
        setTodosLosProductos((prev) =>
          prev.map((p) =>
            p.id_prod === productoAccion.id_prod
              ? { ...p, est_prod: "Inactivo" }
              : p,
          ),
        );
        ToastSuccess({ message: "Producto inactivado exitosamente." });
      } else {
        const respuesta = await fetch(
          SERVICIOS.activarProducto(productoAccion.id_prod),
          { method: "PUT" },
        );
        if (!respuesta.ok) throw new Error("Error al activar el producto");
        setTodosLosProductos((prev) =>
          prev.map((p) =>
            p.id_prod === productoAccion.id_prod
              ? { ...p, est_prod: "Activo" }
              : p,
          ),
        );
        ToastSuccess({ message: "Producto activado exitosamente." });
      }
    } catch (error) {
      ToastError({ message: "Hubo un error al procesar la acción." });
    } finally {
      setProductoAccion(null);
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
          {/* Sección de acciones y búsqueda */}
          <div className="mb-5 flex items-center justify-between">
            <GeneralDialog
              open={abrirCrear}
              onOpenChange={setAbrirCrear}
              triggerText={
                <>
                  <Plus className="h-4 w-4 font-light" /> Añadir nuevos
                  productos
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
                  setTodosLosProductos((prev) => [...prev, data.producto]);
                  setAbrirCrear(false);
                }}
              />
            </GeneralDialog>
            <div className="flex items-center gap-3">
              {/* Buscador */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar producto..."
                  className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                  value={consultaBusqueda}
                  onChange={(e) => {
                    setConsultaBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                />
              </div>
              {/* Dropdown para ordenar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="border-border text-[12px] font-semibold"
                    variant="secondary"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
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
                        setCriterioOrden("expirationAsc");
                        setPaginaActual(1);
                      }}
                    >
                      Por días hasta vencimiento
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
              <Separator className="h-8" orientation="vertical" />
              <Button
                className="border-border text-[12px] font-semibold"
                variant="secondary"
                onClick={() => setAbrirCargaMasiva(true)}
              >
                <Upload className="h-4 w-4" /> Importar
              </Button>
              <Button
                className="border-border text-[12px] font-semibold"
                variant="secondary"
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
                            (p) => p.est_prod === "Activo",
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
                            (p) => p.est_prod === "Inactivo",
                          ).length
                        }
                      </strong>
                    </span>
                  </div>
                </div>
              }
              onClick={() => {
                manejarFiltroMetrica("all");
                setFiltroEstado("all");
              }}
            />

            <MetricCard
              titulo="Stock Crítico"
              valor={
                todosLosProductos.filter(
                  (producto) =>
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
                setFiltroMetrica("critical");
                setPaginaActual(1);
                setFiltroEstado("Activo");
              }}
            />

            <MetricCard
              titulo="Próx. a Caducar"
              valor={
                todosLosProductos.filter((producto) => {
                  const dias = getDaysUntilExpiration(producto.fech_ven_prod);
                  return dias !== null && dias <= diasCaducidad;
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
              onClick={() => manejarFiltroMetrica("soonExpire")}
            />

            <MetricCard
              titulo="Productos Agotados"
              valor={todosLosProductos.filter((p) => p.stock_prod === 0).length}
              porcentaje=""
              periodo="Sin stock - Reposición inmediata"
              iconColor="text-red-500"
              badgeColorClass="bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400"
              onClick={() => {
                setFiltroMetrica("outOfStock");
                setFiltroEstado("Activo");
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
                    setTodosLosProductos((prev) => [
                      ...prev,
                      ...nuevosProductos,
                    ]);
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
                <div className="mt-4 grid h-[210px] grid-cols-1 gap-6 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
                  {productosPaginaActual.map((producto) => (
                    <ProductCard
                      key={producto.id_prod}
                      product={producto}
                      onEdit={(prod) => {
                        const productoParaEditar: IProductEdit = {
                          ...prod,
                          cate_prod:
                            typeof prod.cate_prod === "object"
                              ? prod.cate_prod?.id_cate
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
                categoria: productoEditar.cate_prod.toString(),
                tipo_prod: productoEditar.tip_prod || "",
                undidad_prod: productoEditar.und_prod || "",
                img_prod: productoEditar.img_prod,
              }}
              categoryOptions={opcionesCategorias.filter(
                (opt) => opt.value !== "",
              )}
              onSuccess={(data) => {
                const productoActualizado = data.producto;
                const opcionCategoria = opcionesCategorias.find(
                  (opt) =>
                    opt.value === productoActualizado.cate_prod.toString(),
                );
                const productoConCategoria = {
                  ...productoActualizado,
                  cate_prod: {
                    id_cate: Number(productoActualizado.cate_prod),
                    nom_cate: opcionCategoria ? opcionCategoria.label : "",
                  },
                };

                setTodosLosProductos((prev) =>
                  prev.map((p) =>
                    p.id_prod.toString() ===
                    productoActualizado.id_prod.toString()
                      ? productoConCategoria
                      : p,
                  ),
                );
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
