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
import { Toaster } from "react-hot-toast";
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
import { DialogExportarCategorias } from "@/components/shared/categorias/ui/dialogExportarCategorias";
import { useCategoriasAdmin } from "@/hooks/categorias/useCategoriasAdmin";
import Preloader from "@/components/shared/varios/preloader";

export default function PaginaCategorias() {
  useProtectedRoute();

  const [abrirExportar, setAbrirExportar] = React.useState(false);
  const [abrirCargaMasiva, setAbrirCargaMasiva] = React.useState(false);
  const [abrirCrear, setAbrirCrear] = React.useState(false);
  const [showLoader, setShowLoader] = React.useState(true);
  const [categoriaEditar, setEditCategory] = React.useState<ICategory | null>(
    null,
  );
  const [accionCategoria, setAccionCategoria] = React.useState<{
    id_cate: number;
    nom_cate: string;
    tipo: "activar" | "inactivar";
  } | null>(null);

  const [consulta, setConsulta] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("");

  const {
    categorias,
    isLoading,
    isError,
    refetch,
    activarCategoria,
    inactivarCategoria,
  } = useCategoriasAdmin();

  const confirmarAccionCategoria = async () => {
    if (!accionCategoria) return;

    const { id_cate, nom_cate, tipo } = accionCategoria;

    if (tipo === "inactivar") {
      await inactivarCategoria(id_cate, nom_cate);
    } else {
      await activarCategoria(id_cate, nom_cate);
    }

    setAccionCategoria(null);
  };

  const handleClickTarjeta = (status: string) => {
    if (selectedStatus.toLowerCase() === status.toLowerCase()) {
      setSelectedStatus("");
    } else {
      setSelectedStatus(status);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400); // puedes ajustar este valor si deseas

    return () => clearTimeout(timer);
  }, []);

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
                  className="error-text focus:hover:error-text cursor-pointer"
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

  const filteredCategorias = categorias.filter((cat: any) => {
    const cumpleEstado =
      selectedStatus === "" ||
      cat.est_cate?.toLowerCase() === selectedStatus.toLowerCase();
    const busqueda = consulta.toLowerCase();
    const cumpleBusqueda =
      cat.nom_cate.toLowerCase().includes(busqueda) ||
      (cat.desc_cate && cat.desc_cate.toLowerCase().includes(busqueda));
    return cumpleEstado && cumpleBusqueda;
  });
  if (showLoader) return <Preloader />;
  return (
    <>
      <Toaster position="top-right" />
      <ModulePageLayout
        breadcrumbLinkTitle="Productos"
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
                onSuccess={() => {
                  refetch(); // Revalida los datos desde el servidor
                  setAbrirCrear(false); // Cierra el diálogo
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
                onClick={() => setAbrirExportar(true)}
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
                          (cat: any) =>
                            cat.est_cate?.toLowerCase() === "activo",
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
                          (cat: any) =>
                            cat.est_cate?.toLowerCase() === "inactivo",
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

          {abrirCargaMasiva && (
            <BulkUploadCategoryDialog
              onSuccess={() => {
                refetch(); // Actualiza la lista después de la carga masiva
              }}
              onClose={() => setAbrirCargaMasiva(false)}
            />
          )}

          <div className="px-6 pb-4">
            <DataTable<ICategory>
              data={filteredCategorias}
              columns={categoriaColumnas}
            />
          </div>
        </div>
      </ModulePageLayout>

      {abrirExportar && (
        <DialogExportarCategorias
          open={abrirExportar}
          onOpenChange={setAbrirExportar}
        />
      )}

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
            onSuccess={() => {
              refetch(); // Revalida los datos desde el backend
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
