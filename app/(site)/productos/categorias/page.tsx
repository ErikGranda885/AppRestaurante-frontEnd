"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/varios/dataTable";
import {
  MoreHorizontal,
  Upload,
  Folder,
  FolderX,
  Folders,
  Plus,
  Search,
  CloudDownload,
} from "lucide-react";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { CreateCategoryForm } from "@/components/shared/categorias/formularios/createCategoryForm";
import { BulkUploadCategoryDialog } from "@/components/shared/categorias/formularios/cargaCategory";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { EditCategoryForm } from "@/components/shared/categorias/formularios/editCategoryForm";
import { ICategory } from "@/lib/types";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { Input } from "@/components/ui/input";
import { ModalModEstado } from "@/components/shared/Modales/modalModEstado";

type AccionCategoria = {
  id_cate: number;
  nom_cate: string;
  tipo: "activar" | "inactivar";
};

export default function PaginaCategorias() {
  const [categorias, setCategorias] = React.useState<ICategory[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [consulta, setConsulta] = React.useState<string>("");
  const [categoriaEditar, setEditCategory] = React.useState<ICategory | null>(
    null,
  );
  const [abrirCargaMasiva, setAbrirCargaMasiva] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");
  const [abrirCrear, setAbrirCrear] = React.useState(false);
  const [accionCategoria, setAccionCategoria] =
    React.useState<AccionCategoria | null>(null);

  // Definición de las columnas de la tabla para categorías
  const categoriaColumnas: ColumnDef<ICategory>[] = [
    {
      accessorKey: "nom_cate",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("nom_cate")}</div>
      ),
    },
    {
      accessorKey: "desc_cate",
      header: "Descripción",
      cell: ({ row }) => <div>{row.getValue("desc_cate")}</div>,
    },
    {
      accessorKey: "est_cate",
      header: () => <div className="text-center">Estado</div>,
      cell: ({ row }) => {
        const estadoOriginal = String(row.getValue("est_cate")) || "";
        const estado = estadoOriginal.toLowerCase();

        let colorCirculo = "bg-gray-500";
        let colorTexto = "text-gray-600";

        switch (estado) {
          case "activo":
            colorCirculo = "bg-[#17c964]";
            colorTexto = "";
            break;
          case "inactivo":
            colorCirculo = "bg-[#f31260]";
            colorTexto = "";
            break;
          default:
            colorCirculo = "bg-gray-500";
            colorTexto = "text-gray-600";
            break;
        }

        return (
          <div className="text-center">
            <div className="inline-flex items-center gap-1 p-1">
              <span className={`h-1 w-1 rounded-full ${colorCirculo}`} />
              <span className={`text-xs font-medium capitalize ${colorTexto}`}>
                {estadoOriginal}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setEditCategory(category)}
                className="cursor-pointer"
              >
                Editar
              </DropdownMenuItem>
              {String(category.est_cate).toLowerCase() === "inactivo" ? (
                <DropdownMenuItem
                  onClick={() =>
                    setAccionCategoria({
                      id_cate: category.id_cate,
                      nom_cate: category.nom_cate,
                      tipo: "activar",
                    })
                  }
                  className="cursor-pointer"
                >
                  Activar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() =>
                    setAccionCategoria({
                      id_cate: category.id_cate,
                      nom_cate: category.nom_cate,
                      tipo: "inactivar",
                    })
                  }
                  className="cursor-pointer"
                >
                  Inactivar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  useProtectedRoute();

  // Cargar categorías desde la API
  React.useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar las categorías");
        return res.json();
      })
      .then((data: any) => {
        // Se asume que data.categorias corresponde a ICategory[]
        setCategorias(data.categorias);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  // Función para inactivar una categoría
  const handleDeactivate = (categoria: ICategory) => {
    fetch(`http://localhost:5000/categorias/inactivar/${categoria.id_cate}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setCategorias((prev) =>
          prev.map((cat) =>
            cat.id_cate === categoria.id_cate
              ? { ...cat, est_cate: "Inactivo" }
              : cat,
          ),
        );
        ToastSuccess({
          message: `La categoría "${categoria.nom_cate}" ha sido inactivada con éxito.`,
        });
      })
      .catch((err) => {
        ToastError({
          message: `Error al inactivar la categoría "${categoria.nom_cate}"`,
        });
      });
  };

  // Función para activar una categoría
  const handleActivate = (categoria: ICategory) => {
    fetch(`http://localhost:5000/categorias/activar/${categoria.id_cate}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setCategorias((prev) =>
          prev.map((cat) =>
            cat.id_cate === categoria.id_cate
              ? { ...cat, est_cate: "Activo" }
              : cat,
          ),
        );
        ToastSuccess({
          message: `La categoría "${categoria.nom_cate}" ha sido activada con éxito.`,
        });
      })
      .catch((err) => {
        ToastError({
          message: `Error al activar la categoría "${categoria.nom_cate}"`,
        });
      });
  };

  // Función para confirmar la acción (activar/inactivar) usando el diálogo
  const confirmarAccionCategoria = () => {
    if (!accionCategoria) return;
    const categoria = categorias.find(
      (cat) => cat.id_cate === accionCategoria.id_cate,
    );
    if (!categoria) return;
    if (accionCategoria.tipo === "inactivar") {
      handleDeactivate(categoria);
    } else {
      handleActivate(categoria);
    }
    setAccionCategoria(null);
  };

  // Filtrar categorías según estado y consulta
  const filteredCategorias = categorias.filter((cat) => {
    const cumpleEstado =
      selectedStatus === "" ||
      cat.est_cate?.toLowerCase() === selectedStatus.toLowerCase();
    const busqueda = consulta.toLowerCase();
    const cumpleBusqueda =
      cat.nom_cate.toLowerCase().includes(busqueda) ||
      (cat.desc_cate && cat.desc_cate.toLowerCase().includes(busqueda));
    return cumpleEstado && cumpleBusqueda;
  });

  // Cambiar filtro de estado desde las tarjetas
  const handleClickTarjeta = (status: string) => {
    if (selectedStatus.toLowerCase() === status.toLowerCase()) {
      setSelectedStatus("");
    } else {
      setSelectedStatus(status);
    }
  };

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (cargando) return <div className="p-4">Cargando categorías...</div>;

  return (
    <>
      <Toaster position="top-right" />
      <ModulePageLayout
        breadcrumbLinkTitle="Inventario"
        breadcrumbPageTitle="Gestión de Categorías"
        submenu={true}
        isLoading={false}
      >
        <div className="px-6 pt-2">
          <h1 className="text-xl font-bold">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Aquí puedes gestionar las categorias de tu negocio.
          </p>
          <div className="pt-4" />
          <div className="mb-5 flex items-center justify-between">
            <GeneralDialog
              open={abrirCrear}
              onOpenChange={setAbrirCrear}
              triggerText={
                <>
                  <Plus className="h-4 w-4 font-light" /> Añade nueva categoría
                </>
              }
              title="Crear Nueva Categoría"
              description="Ingresa la información para crear una nueva categoría."
              submitText="Crear Categoría"
            >
              <CreateCategoryForm
                onSuccess={(data: any) => {
                  setCategorias((prev) => [...prev, data.categoria]);
                  setAbrirCrear(false);
                }}
              />
            </GeneralDialog>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar categorías..."
                  className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                  value={consulta}
                  onChange={(e) => setConsulta(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setAbrirCargaMasiva(true)}
                className="border-border text-[12px] font-semibold"
                variant="secondary"
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
        </div>
        <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
          {/* Tarjetas resumen */}
          <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
            {/* Tarjeta: Categorías Totales */}
            <Card
              onClick={() => handleClickTarjeta("")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${selectedStatus === "" ? "ring-2 ring-secondary" : ""} group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Categorías Totales
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {categorias.length}
                    </span>
                    <span className="inline-block rounded-md bg-secondary px-2 py-1 text-sm font-bold dark:bg-blue-800/30">
                      +5%
                    </span>
                  </div>
                  <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                  <Folders className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>
            {/* Tarjeta: Categorías Activas */}
            <Card
              onClick={() => handleClickTarjeta("Activo")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${selectedStatus.toLowerCase() === "activo" ? "ring-2 ring-secondary" : ""} group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Categorías Activas
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {
                        categorias.filter(
                          (cat) => cat.est_cate?.toLowerCase() === "activo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-green-100 px-2 py-1 text-sm font-bold text-green-500 dark:bg-green-800/30 dark:text-green-400">
                      +10%
                    </span>
                  </div>
                  <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                  <Folder className="h-7 w-7 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>
            {/* Tarjeta: Categorías Inactivas */}
            <Card
              onClick={() => handleClickTarjeta("Inactivo")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${selectedStatus.toLowerCase() === "inactivo" ? "ring-2 ring-secondary" : ""} group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Categorías Inactivas
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {
                        categorias.filter(
                          (cat) => cat.est_cate?.toLowerCase() === "inactivo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-red-100 px-2 py-1 text-sm font-bold dark:bg-red-800/30">
                      -8%
                    </span>
                  </div>
                  <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                  <FolderX className="h-7 w-7 text-red-500 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Diálogo para carga masiva */}
          {abrirCargaMasiva && (
            <BulkUploadCategoryDialog
              onSuccess={(nuevasCategorias: ICategory[]) => {
                setCategorias((prev) => [...prev, ...nuevasCategorias]);
              }}
              onClose={() => setAbrirCargaMasiva(false)}
            />
          )}

          {/* Tabla de categorías */}
          <div className="px-6 pb-4">
            <DataTable<ICategory>
              data={filteredCategorias}
              columns={categoriaColumnas}
            />
          </div>
        </div>
      </ModulePageLayout>

      {/* Diálogo para editar categoría */}
      {categoriaEditar && (
        <GeneralDialog
          open={!!categoriaEditar}
          onOpenChange={(open) => {
            if (!open) setEditCategory(null);
          }}
          triggerText={null}
          title="Editar Categoría"
          description="Modifica la información de la categoría."
          submitText="Guardar cambios"
        >
          <EditCategoryForm
            initialData={categoriaEditar}
            onSuccess={(data: any) => {
              setCategorias((prev) =>
                prev.map((cat) =>
                  cat.id_cate === data.categoria.id_cate ? data.categoria : cat,
                ),
              );
              setEditCategory(null);
            }}
          />
        </GeneralDialog>
      )}

      {accionCategoria && (
        <ModalModEstado
          abierto={true}
          onCambioAbierto={(open) => {
            if (!open) setAccionCategoria(null);
          }}
          tipoAccion={accionCategoria.tipo}
          nombreElemento={accionCategoria.nom_cate}
          onConfirmar={confirmarAccionCategoria}
        />
      )}

      <Toaster position="top-right" />
    </>
  );
}
