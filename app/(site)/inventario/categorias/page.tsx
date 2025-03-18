"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/dataTable";
import {
  Tag,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Info,
  Upload,
  Folders,
  Folder,
  FolderX,
  FolderCog,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { EditCategoryForm } from "@/components/shared/categories-comp/editCategoryForm";
import { BulkUploadCategoryDialog } from "@/components/shared/categories-comp/cargaCategory";

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
  const [delayedLoading, setDelayedLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editCategory, setEditCategory] = React.useState<DataCategories | null>(
    null
  );
  const [openBulkUpload, setOpenBulkUpload] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");
  const [openCreate, setOpenCreate] = React.useState(false);

  // Activar delayedLoading si la carga demora más de 1 segundo
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setDelayedLoading(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [loading]);

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
          statusStyles =
            "px-3 text-success border-green-500 dark:bg-[#377cfb]/10";
        } else if (status === "inactivo") {
          statusStyles =
            "px-2 text-default border-default dark:bg-[#377cfb]/10 dark:text-default-400";
        }
        return (
          <div className="text-right font-medium">
            <span className={`border py-1 rounded ${statusStyles}`}>
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
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:border dark:border-default-700 dark:bg-[#09090b] dark:text-white"
            >
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
            cat.id === category.id ? { ...cat, estado: "Inactivo" } : cat
          )
        );
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } relative flex w-96 items-start gap-3 p-4 bg-[#F0FFF4] border border-[#4ADE80] rounded-lg shadow-lg`}
              style={{ animationDuration: "3s" }}
            >
              <CheckCircle className="w-6 h-6 text-[#166534] mt-1" />
              <div className="flex-1">
                <p className="text-[#166534] text-sm font-semibold">
                  Mensaje Informativo
                </p>
                <p className="text-sm text-[#166534]/80">
                  Se ha inactivado la categoría exitosamente.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          { duration: 2000, position: "top-right" }
        );
      })
      .catch((err) => {
        toast.error("Error al inactivar la categoría", { duration: 3000 });
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
            cat.id === category.id ? { ...cat, estado: "Activo" } : cat
          )
        );
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } relative flex w-96 items-start gap-3 p-4 bg-[#F0FFF4] border border-[#4ADE80] rounded-lg shadow-lg`}
              style={{ animationDuration: "3s" }}
            >
              <CheckCircle className="w-6 h-6 text-[#166534] mt-1" />
              <div className="flex-1">
                <p className="text-[#166534] text-sm font-semibold">
                  Mensaje Informativo
                </p>
                <p className="text-sm text-[#166534]/80">
                  Se ha activado la categoría exitosamente.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          { duration: 2000, position: "top-right" }
        );
      })
      .catch((err) => {
        toast.error("Error al activar la categoría", { duration: 3000 });
        console.error("Error al activar categoría:", err);
      });
  };

  // Filtrado de categorías según estado
  const filteredCategories =
    selectedStatus === ""
      ? categories
      : categories.filter(
          (cat) => cat.estado?.toLowerCase() === selectedStatus.toLowerCase()
        );

  const handleCardClick = (status: string) => {
    if (selectedStatus.toLowerCase() === status.toLowerCase()) {
      setSelectedStatus("");
    } else {
      setSelectedStatus(status);
    }
  };

  const cardClass = (status: string) =>
    `bg-default-100 flex items-center justify-start pl-6 dark:bg-[#09090b] dark:border-2 dark:border-default-700 w-64 h-24 rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 ${
      selectedStatus.toLowerCase() === status.toLowerCase()
        ? "ring-2 ring-[hsl(var(--secondary))] dark:ring-[hsl(var(--secondary))]"
        : ""
    }`;

  const renderHoverContent = (mensaje: string) => (
    <HoverCardContent className="w-60 p-3 bg-white dark:bg-black rounded-lg shadow-lg dark:border dark:border-default-700">
      <div className="flex items-center space-x-2 ">
        <Info className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <p className="text-sm text-gray-700 dark:text-gray-300">{mensaje}</p>
      </div>
    </HoverCardContent>
  );

  // Si hay error, mostrar mensaje de error
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  // Renderizado final
  return (
    <>
      <Toaster position="top-right" />
      <ModulePageLayout
        breadcrumbLinkTitle="Gestión de Categorías"
        breadcrumbPageTitle=""
        submenu={false}
        isLoading={false}
      >
        <div className="bg-[hsl(var(--card))] dark:bg-[#09090b] w-full h-full rounded-lg">
          {/* Tarjetas de filtro */}
          <div className="flex flex-row gap-3 justify-between px-6 pt-6">
            {/* Categorías Totales */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={cardClass("")}
                  onClick={() => handleCardClick("")}
                >
                  <div className="border-2 border-primary p-2 rounded-full dark:bg-[#377cfb]/10 shadow">
                    <Folders
                      className="text-primary"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col pl-3">
                    <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Categorías Totales
                    </h1>
                    <h3>{categories.length}</h3>
                  </div>
                </div>
              </HoverCardTrigger>
              {renderHoverContent("Muestra todas las categorías.")}
            </HoverCard>

            {/* Categorías Activas */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={cardClass("Activo")}
                  onClick={() => handleCardClick("Activo")}
                >
                  <div className="border-2 p-2 rounded-full dark:bg-[#66cc8a]/10 shadow border-success">
                    <Folder
                      className="text-success"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col pl-3">
                    <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Categorías Activas
                    </h1>
                    <h3>
                      {
                        categories.filter(
                          (cat) => cat.estado?.toLowerCase() === "activo"
                        ).length
                      }
                    </h3>
                  </div>
                </div>
              </HoverCardTrigger>
              {renderHoverContent("Filtra las categorías activas.")}
            </HoverCard>

            {/* Categorías Inactivas */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={cardClass("Inactivo")}
                  onClick={() => handleCardClick("Inactivo")}
                >
                  <div className="border-2 p-2 rounded-full dark:bg-[#485248]/10 shadow border-default">
                    <FolderX
                      className="text-default"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col pl-3">
                    <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Categorías Inactivas
                    </h1>
                    <h3>
                      {
                        categories.filter(
                          (cat) => cat.estado?.toLowerCase() === "inactivo"
                        ).length
                      }
                    </h3>
                  </div>
                </div>
              </HoverCardTrigger>
              {renderHoverContent("Filtra las categorías inactivas.")}
            </HoverCard>

            {/* Categorías Actualizadas */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={cardClass("Modificado")}
                  onClick={() => handleCardClick("Modificado")}
                >
                  <div className="border-2 p-2 rounded-full dark:bg-[#ffbe00]/10 shadow-[0_0_10px_rgba(255,244,204,0.5)] dark:shadow-[0_0_10px_rgba(255,190,0,0.5)] border-warning">
                    <FolderCog
                      className="text-warning"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col pl-3">
                    <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Categorias Modificadas
                    </h1>
                    <h3>
                      {
                        categories.filter(
                          (user) => user.estado?.toLowerCase() === "modificado"
                        ).length
                      }
                    </h3>
                  </div>
                </div>
              </HoverCardTrigger>
              {renderHoverContent("Muestra las categorías actualizadas.")}
            </HoverCard>
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

          {/* Crear Nueva Categoría */}
          <div className="flex justify-end px-6 pt-5 pb-9 space-x-4">
            <Button
              onClick={() => setOpenBulkUpload(true)}
              variant={"secondary"}
              className="bg-secondary-500 text-white dark:text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
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

          {/* Tabla */}
          <div className="px-6 pb-4">
            <DataTable<DataCategories>
              data={filteredCategories}
              columns={categoryColumns}
            />
          </div>
        </div>

        {/* Editar Categoría */}
        {editCategory && (
          <Dialog
            open
            onOpenChange={(open) => {
              if (!open) setEditCategory(null);
            }}
          >
            <DialogContent className="sm:max-w-[425px] dark:border dark:border-default-700 dark:bg-[#09090b]">
              <DialogHeader>
                <DialogTitle>Editar Categoría</DialogTitle>
                <DialogDescription>
                  Modifica la información de la categoría.
                </DialogDescription>
              </DialogHeader>
              <EditCategoryForm
                initialData={{
                  id: editCategory.id,
                  nombre: editCategory.nombre,
                  descripcion: editCategory.descripcion || "",
                }}
                onSuccess={(data: any) => {
                  const updated: DataCategories = {
                    id: data.categoria.id_cate.toString(),
                    nombre: data.categoria.nom_cate,
                    descripcion: data.categoria.desc_cate,
                    estado: data.categoria.est_cate,
                  };
                  setCategories((prev) =>
                    prev.map((cat) => (cat.id === updated.id ? updated : cat))
                  );
                  setEditCategory(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </ModulePageLayout>
    </>
  );
}
