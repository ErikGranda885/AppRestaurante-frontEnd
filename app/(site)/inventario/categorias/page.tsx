"use client";

import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/dataTable";
import {
  CheckCircle,
  MoreHorizontal,
  Upload,
  Folder,
  FolderX,
  FolderCog,
  Folders,
} from "lucide-react";
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
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        // Ajusta aquí las clases de estilo para estado
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
        toast.success("Categoría inactivada correctamente");
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
        toast.success("Categoría activada correctamente");
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

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  if (loading) {
    return <div className="p-4">Cargando categorías...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <ModulePageLayout
        breadcrumbLinkTitle="Inventario"
        breadcrumbPageTitle="Gestión de Categorías"
        submenu={true}
        isLoading={false}
      >
        <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#09090b]">
          {/* Tarjetas en formato grid, similar a la página de usuarios */}
          <div className="grid grid-cols-1 gap-4 px-6 pt-6 md:grid-cols-4">
            {/* Tarjeta: Categorías Totales */}
            <Card
              onClick={() => handleCardClick("")}
              className={`dark:border-border cursor-pointer transition-shadow hover:shadow-lg ${
                selectedStatus === "" ? "ring-2 ring-secondary" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">Categorías Totales</CardTitle>
                <CardDescription className="text-sm">
                  {categories.length} categorías
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Folders className="h-5 w-5" />
              </CardFooter>
            </Card>

            {/* Tarjeta: Categorías Activas */}
            <Card
              onClick={() => handleCardClick("Activo")}
              className={`dark:border-border cursor-pointer transition-shadow hover:shadow-lg ${
                selectedStatus.toLowerCase() === "activo"
                  ? "ring-2 ring-secondary"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">Categorías Activas</CardTitle>
                <CardDescription className="text-sm">
                  {
                    categories.filter(
                      (cat) => cat.estado?.toLowerCase() === "activo",
                    ).length
                  }{" "}
                  activas
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Folder className="success-text h-5 w-5" />
              </CardFooter>
            </Card>

            {/* Tarjeta: Categorías Inactivas */}
            <Card
              onClick={() => handleCardClick("Inactivo")}
              className={`dark:border-border cursor-pointer transition-shadow hover:shadow-lg ${
                selectedStatus.toLowerCase() === "inactivo"
                  ? "ring-2 ring-secondary"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">Categorías Inactivas</CardTitle>
                <CardDescription className="text-sm">
                  {
                    categories.filter(
                      (cat) => cat.estado?.toLowerCase() === "inactivo",
                    ).length
                  }{" "}
                  inactivas
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <FolderX className="error-text h-5 w-5" />
              </CardFooter>
            </Card>

            {/* Tarjeta: Categorías Modificadas */}
            <Card
              onClick={() => handleCardClick("Modificado")}
              className={`dark:border-border cursor-pointer transition-shadow hover:shadow-lg ${
                selectedStatus.toLowerCase() === "modificado"
                  ? "ring-2 ring-secondary"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  Categorías Modificadas
                </CardTitle>
                <CardDescription className="text-sm">
                  {
                    categories.filter(
                      (cat) => cat.estado?.toLowerCase() === "modificado",
                    ).length
                  }{" "}
                  modificadas
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <FolderCog className="h-5 w-5 text-yellow-500" />
              </CardFooter>
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

        {/* Editar Categoría */}
        {editCategory && (
          <Dialog
            open
            onOpenChange={(open) => {
              if (!open) setEditCategory(null);
            }}
          >
            <DialogContent className="border-border sm:max-w-[425px]">
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
                    prev.map((cat) => (cat.id === updated.id ? updated : cat)),
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
