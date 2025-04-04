"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";

import { DataTable } from "@/components/shared/dataTable";
import {
  MoreHorizontal,
  Upload,
  Folder,
  FolderX,
  Folders,
  CheckCircle,
} from "lucide-react";

import { GeneralDialog } from "@/components/shared/dialogGen";
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
import { CreateCategoryForm } from "@/components/shared/categories-comp/createCategoryForm";

import { BulkUploadCategoryDialog } from "@/components/shared/categories-comp/cargaCategory";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { EditCategoryForm } from "@/components/shared/categories-comp/editCategoryForm";

// Definición del tipo Category
export type DataCategories = {
  id: string;
  nombre: string;
  descripcion?: string;
  estado?: string;
};

export default function Page() {
  const [categories, setCategories] = React.useState<DataCategories[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [editCategory, setEditCategory] = React.useState<DataCategories | null>(
    null,
  );
  const [openBulkUpload, setOpenBulkUpload] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");
  const [openCreate, setOpenCreate] = React.useState(false);
  useProtectedRoute();
  // Cargar categorías desde la API
  React.useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar las categorías");
        }
        return res.json();
      })
      .then((data: any) => {
        const transformed = data.categorias.map((item: any) => ({
          id: item.id_cate.toString(),
          nombre: item.nom_cate,
          descripcion: item.desc_cate,
          estado: item.est_cate,
        }));
        setCategories(transformed);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /* Definición de las columnas de la tabla para categorías */
  const categoryColumns: ColumnDef<DataCategories>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("nombre")}</div>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => <div>{row.getValue("descripcion")}</div>,
    },
    {
      accessorKey: "estado",
      header: () => <div className="text-right">Estado</div>,
      cell: ({ row }) => {
        const status = String(row.getValue("estado")).toLowerCase();
        let statusStyles = "border-gray-100 text-gray-100";
        if (status === "activo") {
          statusStyles = "px-3.5 success-text border-[--success-per]";
        } else if (status === "inactivo") {
          statusStyles = "px-2 error-text border-[--error-per]";
        }
        return (
          <div className="text-right font-medium">
            <span className={`rounded border py-1 ${statusStyles}`}>
              {row.getValue("estado")}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
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
              {String(category.estado).toLowerCase() === "inactivo" ? (
                <DropdownMenuItem
                  onClick={() => handleActivate(category)}
                  className="cursor-pointer"
                >
                  Activar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleDeactivate(category)}
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

  const handleDeactivate = (category: DataCategories) => {
    fetch(`http://localhost:5000/categorias/inactivar/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === category.id ? { ...cat, estado: "Inactivo" } : cat,
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
                  La categoría "{category.nombre}" ha sido inactivada con éxito.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          { duration: 2000, position: "top-right" },
        );
      })
      .catch((err) => {
        toast.error("Error al inactivar la categoría");
        console.error("Error al inactivar categoría:", err);
      });
  };

  const handleActivate = (category: DataCategories) => {
    fetch(`http://localhost:5000/categorias/activar/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === category.id ? { ...cat, estado: "Activo" } : cat,
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
                  La categoría "{category.nombre}" ha sido activada con éxito.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          { duration: 2000, position: "top-right" },
        );
      })
      .catch((err) => {
        toast.error("Error al activar la categoría");
        console.error("Error al activar categoría:", err);
      });
  };

  // Filtrado de categorías según estado
  const filteredCategories =
    selectedStatus === ""
      ? categories
      : categories.filter(
          (cat) => cat.estado?.toLowerCase() === selectedStatus.toLowerCase(),
        );

  const handleCardClick = (status: string) => {
    if (selectedStatus.toLowerCase() === status.toLowerCase()) {
      setSelectedStatus("");
    } else {
      setSelectedStatus(status);
    }
  };

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (loading) return <div className="p-4">Cargando categorías...</div>;

  return (
    <>
      <Toaster position="top-right" />
      <ModulePageLayout
        breadcrumbLinkTitle="Inventario"
        breadcrumbPageTitle="Gestión de Categorías"
        submenu={true}
        isLoading={false}
      >
        <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
          {/* Tarjetas en formato flex, distribuidas equitativamente */}
          <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
            {/* Tarjeta: Categorías Totales */}
            <Card
              onClick={() => handleCardClick("")}
              className={`flex-1 cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                selectedStatus === "" ? "ring-2 ring-secondary" : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Categorías Totales
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {categories.length}
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
              onClick={() => handleCardClick("Activo")}
              className={`flex-1 cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                selectedStatus.toLowerCase() === "activo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  {/* Título de la métrica */}
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Categorías Activas
                  </CardTitle>
                  {/* Valor y badge de porcentaje */}
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {
                        categories.filter(
                          (cat) => cat.estado?.toLowerCase() === "activo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-green-100 px-2 py-1 text-sm font-bold text-green-500 dark:bg-green-800/30 dark:text-green-400">
                      +10%
                    </span>
                  </div>
                  {/* Periodo */}
                  <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Este mes
                  </CardDescription>
                </div>
                {/* Ícono con efecto hover */}
                <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                  <Folder className="h-7 w-7 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>

            {/* Tarjeta: Categorías Inactivas */}
            <Card
              onClick={() => handleCardClick("Inactivo")}
              className={`flex-1 cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                selectedStatus.toLowerCase() === "inactivo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  {/* Título de la métrica */}
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Categorías Inactivas
                  </CardTitle>
                  {/* Valor y badge de porcentaje */}
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {
                        categories.filter(
                          (cat) => cat.estado?.toLowerCase() === "inactivo",
                        ).length
                      }
                    </span>
                    <span className="error-text inline-block rounded-md bg-red-100 px-2 py-1 text-sm font-bold dark:bg-red-800/30">
                      -8%
                    </span>
                  </div>
                  {/* Periodo */}
                  <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Este mes
                  </CardDescription>
                </div>
                {/* Ícono con efecto hover */}
                <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                  <FolderX className="error-text h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Diálogo para carga masiva */}
          {openBulkUpload && (
            <BulkUploadCategoryDialog
              onSuccess={(newCategories: any[]) => {
                const formatted = newCategories.map((u: any) => ({
                  id: u.id_cate.toString(),
                  nombre: u.nom_cate,
                  descripcion: u.desc_cate,
                  estado: u.est_cate,
                }));
                setCategories((prev) => [...prev, ...formatted]);
              }}
              onClose={() => setOpenBulkUpload(false)}
            />
          )}
          {editCategory && (
            <GeneralDialog
              open={!!editCategory}
              onOpenChange={(open) => {
                if (!open) setEditCategory(null);
              }}
              triggerText={null}
              title="Editar Categoría"
              description="Modifica la información de la categoría."
              submitText="Guardar cambios"
            >
              <EditCategoryForm
                initialData={editCategory}
                onSuccess={(data: any) => {
                  // Actualiza la lista de categorías en el componente padre
                  // y cierra el diálogo
                  setCategories((prev) =>
                    prev.map((cat) =>
                      cat.id === data.categoria.id_cate.toString()
                        ? {
                            id: data.categoria.id_cate.toString(),
                            nombre: data.categoria.nom_cate,
                            descripcion: data.categoria.desc_cate,
                            estado: data.categoria.est_cate,
                          }
                        : cat,
                    ),
                  );
                  setEditCategory(null);
                }}
              />
            </GeneralDialog>
          )}

          {/* Botones de acciones: Importar y Crear */}
          <div className="flex justify-end space-x-4 px-6 pb-4 pt-5">
            <Button onClick={() => setOpenBulkUpload(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>

            <GeneralDialog
              open={openCreate}
              onOpenChange={setOpenCreate}
              triggerText={<>Nueva Categoría</>}
              title="Crear Nueva Categoría"
              description="Ingresa la información para crear una nueva categoría."
              submitText="Crear Categoría"
            >
              <CreateCategoryForm
                onSuccess={(data: any) => {
                  const created: DataCategories = {
                    id: data.categoria.id_cate.toString(),
                    nombre: data.categoria.nom_cate,
                    descripcion: data.categoria.desc_cate,
                    estado: data.categoria.est_cate,
                  };
                  setCategories((prev) => [...prev, created]);
                  setOpenCreate(false);
                }}
              />
            </GeneralDialog>
          </div>

          {/* Tabla de categorías */}
          <div className="px-6 pb-4">
            <DataTable<DataCategories>
              data={filteredCategories}
              columns={categoryColumns}
            />
          </div>
        </div>
      </ModulePageLayout>
    </>
  );
}
