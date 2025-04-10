"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/dataTable";
import { Button } from "@/components/ui/button";
import { CheckCircle, MoreHorizontal, Upload } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { GeneralDialog } from "@/components/shared/dialogGen";
import { CreateInsumoForm } from "@/components/shared/insumos-comp/createInsumoForm";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { IInsumo } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditInsumoForm } from "@/components/shared/insumos-comp/editInsumoForm";
import { UNIT_OPTIONS } from "@/lib/constants";
import toast from "react-hot-toast";
import { BulkUploadInsumosDialog } from "@/components/shared/insumos-comp/cargarInsumos";

const isVencimientoProximo = (fecha: string | undefined): boolean => {
  if (!fecha) return false;
  // Por ejemplo, se considera "próximo" si la fecha es menor o igual a "30/04"
  return fecha <= "30/04";
};

export default function InsumosPage() {
  useProtectedRoute();
  const [insumos, setInsumos] = React.useState<IInsumo[]>([]);
  const [editInsumo, setEditInsumo] = React.useState<IInsumo | null>(null);
  // Filtro: "todos" | "bajoStock" | "vencimiento"
  const [activeFilter, setActiveFilter] = React.useState<
    "todos" | "bajoStock" | "vencimiento"
  >("todos");
  const [openBulkUpload, setOpenBulkUpload] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState(false);

  const insumoColumns = [
    {
      accessorKey: "nom_ins",
      header: "Nombre",
      cell: ({ row }: any) => <div>{row.getValue("nom_ins")}</div>,
    },
    {
      accessorKey: "und_ins",
      header: "Unidad",
      cell: ({ row }: any) => <div>{row.getValue("und_ins")}</div>,
    },
    {
      accessorKey: "stock_ins",
      header: "Stock",
      cell: ({ row }: any) => <div>{row.getValue("stock_ins")}</div>,
    },
    {
      accessorKey: "stock_min_ins",
      header: "Stock Mín.",
      cell: ({ row }: any) => <div>{row.getValue("stock_min_ins")}</div>,
    },
    {
      accessorKey: "fech_ven_ins",
      header: "F. Venc.",
      cell: ({ row }: any) => <div>{row.getValue("fech_ven_ins") || "-"}</div>,
    },
    {
      accessorKey: "cost_uni_ins",
      header: "Costo Unit.",
      cell: ({ row }: any) => <div>{row.getValue("cost_uni_ins")}</div>,
    },
    {
      accessorKey: "est_insu",
      header: () => <div className="text-center">Estado</div>,
      cell: ({ row }: any) => {
        const estadoOriginal = String(row.getValue("est_insu")) || "";
        const estado = estadoOriginal.toLowerCase();

        let circleColor = "bg-gray-500";
        let textColor = "text-gray-600";

        switch (estado) {
          case "activo":
            circleColor = "bg-[#17c964]";
            textColor = "";
            break;
          case "inactivo":
            circleColor = "bg-[#f31260]";
            textColor = "";
            break;

          default:
            circleColor = "bg-gray-500";
            textColor = "text-gray-600";
            break;
        }

        return (
          // Contenedor centrado
          <div className="text-center">
            <div className="inline-flex items-center justify-start gap-1 p-1">
              <span className={`h-1 w-1 rounded-full ${circleColor}`} />
              <span className={`text-xs font-medium capitalize ${textColor}`}>
                {estadoOriginal}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      enableHiding: false,
      cell: ({ row }: any) => {
        const insumo = row.original;
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
                onClick={() => setEditInsumo(insumo)}
                className="cursor-pointer"
              >
                Editar
              </DropdownMenuItem>
              {String(insumo.est_insu).toLowerCase() === "inactivo" ? (
                <DropdownMenuItem
                  onClick={() => handleActivar(insumo)}
                  className="cursor-pointer"
                >
                  Activar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleInactivar(insumo)}
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
  // Cargar los insumos desde la API y quedarse solo con los activos
  React.useEffect(() => {
    fetch("http://localhost:5000/insumos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar insumos");
        return res.json();
      })
      .then((data: any[]) => {
        const transformed: IInsumo[] = data.map((item) => ({
          id_ins: item.id_ins,
          nom_ins: item.nom_ins,
          und_ins: item.und_ins,
          stock_ins: Number(item.stock_ins),
          stock_min_ins: Number(item.stock_min_ins),
          cost_uni_ins: Number(item.cost_uni_ins || 0),
          fech_ven_ins: item.fech_ven_ins,
          est_insu: item.est_insu,
        }));
        setInsumos(transformed);
      })
      .catch((err) => console.error(err));
  }, []);
  /*  */
  // Función para activar un insumo
  const handleActivar = async (insumo: IInsumo) => {
    try {
      const response = await fetch(
        `http://localhost:5000/insumos/activar/${insumo.id_ins}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...insumo, est_insu: "activo" }),
        },
      );
      if (!response.ok) throw new Error("Error al activar insumo");
      setInsumos((prev) =>
        prev.map((i) =>
          i.id_ins === insumo.id_ins ? { ...i, est_insu: "activo" } : i,
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
                Insumo activado exitosamente.
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
      console.error(error);
    }
  };
  // Función para inactivar un insumo
  const handleInactivar = async (insumo: IInsumo) => {
    try {
      const response = await fetch(
        `http://localhost:5000/insumos/inactivar/${insumo.id_ins}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...insumo, est_insu: "inactivo" }),
        },
      );
      if (!response.ok) throw new Error("Error al inactivar insumo");
      setInsumos((prev) =>
        prev.map((i) =>
          i.id_ins === insumo.id_ins ? { ...i, est_insu: "inactivo" } : i,
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
                Insumo inactivado exitosamente.
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
      console.error(error);
    }
  };

  // Cálculos para las métricas de las tarjetas
  const totalInsumos = insumos.length;
  const insumosBajoStock = insumos.filter(
    (insumo) => insumo.stock_ins < insumo.stock_min_ins,
  );
  const proximosVencimientos = insumos.filter((insumo) =>
    isVencimientoProximo(insumo.fech_ven_ins),
  );
  const stockTotal = insumos.reduce((acc, insumo) => acc + insumo.stock_ins, 0);

  // Filtrar la lista que se muestra según el filtro activo
  let displayedInsumos = insumos;
  if (activeFilter === "bajoStock") {
    displayedInsumos = insumosBajoStock;
  } else if (activeFilter === "vencimiento") {
    displayedInsumos = proximosVencimientos;
  }

  // Si se hace clic en una tarjeta, se activa o desactiva el filtro
  const handleCardClick = (filter: "todos" | "bajoStock" | "vencimiento") => {
    if (activeFilter === filter) {
      setActiveFilter("todos");
    } else {
      setActiveFilter(filter);
    }
  };

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Insumos"
      breadcrumbPageTitle="Gestión de Insumos"
      submenu={true}
      isLoading={false}
    >
      <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] p-6 dark:bg-[#111315]">
        {/* Sección de tarjetas métricas */}
        <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
          {/* Tarjeta: Total de Insumos Activos */}
          <Card
            onClick={() => handleCardClick("todos")}
            className={`flex-1 cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
              activeFilter === "todos" ? "ring-2 ring-secondary" : ""
            } group`}
          >
            <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
              <div className="flex-1">
                <CardTitle className="text-sm font-light text-secondary-foreground">
                  Total de Insumos Activos
                </CardTitle>
                <div className="mt-2 flex items-center gap-5">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                    {totalInsumos}
                  </span>
                  <span className="inline-block rounded-md bg-secondary px-2 py-1 text-sm font-bold dark:bg-green-800/30">
                    +0%
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  Este mes
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Tarjeta: Insumos Bajo Stock */}
          <Card
            onClick={() => handleCardClick("bajoStock")}
            className={`flex-1 cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
              activeFilter === "bajoStock" ? "ring-2 ring-secondary" : ""
            } group`}
          >
            <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
              <div className="flex-1">
                <CardTitle className="text-sm font-light text-secondary-foreground">
                  Insumos Bajo Stock
                </CardTitle>
                <div className="mt-2 flex items-center gap-5">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                    {insumosBajoStock.length}
                  </span>
                  <span className="inline-block rounded-md bg-yellow-100 px-2 py-1 text-sm font-bold text-yellow-500 dark:bg-yellow-800/30">
                    -5%
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  Este mes
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Tarjeta: Próximos Vencimientos */}
          <Card
            onClick={() => handleCardClick("vencimiento")}
            className={`flex-1 cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
              activeFilter === "vencimiento" ? "ring-2 ring-secondary" : ""
            } group`}
          >
            <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
              <div className="flex-1">
                <CardTitle className="text-sm font-light text-secondary-foreground">
                  Próximos Vencimientos
                </CardTitle>
                <div className="mt-2 flex items-center gap-5">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                    {proximosVencimientos.length}
                  </span>
                  <span className="inline-block rounded-md bg-pink-100 px-2 py-1 text-sm font-bold text-pink-500 dark:bg-pink-800/30">
                    +3%
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  Este mes
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
        {/* Dialog de carga masiva */}
        {openBulkUpload && (
          <BulkUploadInsumosDialog
            onSuccess={(newInsumos: IInsumo[]) => {
              setInsumos((prev) => [...prev, ...newInsumos]);
              setOpenBulkUpload(false);
            }}
            onClose={() => setOpenBulkUpload(false)}
            
          />
        )}
        {/* Acciones: Importar y Crear insumo */}
        <div className="flex justify-end space-x-4 px-6 pb-4 pt-5">
          <Button onClick={() => setOpenBulkUpload(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <GeneralDialog
            open={openCreate}
            onOpenChange={setOpenCreate}
            triggerText="Nuevo Insumo"
            title="Crear Nuevo Insumo"
            description="Ingresa la información para crear un nuevo insumo"
            submitText="Crear Insumo"
            contentWidth="425px"
            contentHeight="auto"
          >
            <CreateInsumoForm
              onSuccess={(newInsumo: IInsumo) => {
                if (newInsumo.est_insu.toLowerCase() === "activo") {
                  setInsumos((prev) => [...prev, newInsumo]);
                }
                setOpenCreate(false);
              }}
            />
          </GeneralDialog>
        </div>

        {/* Tabla de insumos */}
        <div className="px-6 pb-4">
          <DataTable<IInsumo> data={displayedInsumos} columns={insumoColumns} />
        </div>
      </div>
      {/* Editar insumo */}
      {editInsumo && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setEditInsumo(null);
          }}
        >
          <DialogContent className="border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Insumo</DialogTitle>
              <DialogDescription>
                Modifica la información del insumo
              </DialogDescription>
            </DialogHeader>
            <EditInsumoForm
              initialData={{
                id_ins: editInsumo.id_ins.toString(),
                nom_ins: editInsumo.nom_ins,
                und_ins: editInsumo.und_ins,
                stock_ins: editInsumo.stock_ins,
                stock_min_ins: editInsumo.stock_min_ins,
                cost_uni_ins: editInsumo.cost_uni_ins,
                fech_ven_ins: (() => {
                  const parts = editInsumo.fech_ven_ins.split("/");
                  if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    return new Date(year, month, day);
                  }
                  return new Date();
                })(),
              }}
              unitOptions={UNIT_OPTIONS}
              onSuccess={(response) => {
                // Extrae el insumo actualizado (asumiendo que la respuesta tiene la forma { message, insumo })
                const updatedInsumo = response.insumo;
                console.log("Updated insumo from API:", updatedInsumo);
                setInsumos((prev) =>
                  prev.map((insumo) => {
                    const isUpdated =
                      String(insumo.id_ins) === String(updatedInsumo.id_ins);
                    console.log(
                      "Comparing insumo:",
                      String(insumo.id_ins),
                      "with updated:",
                      String(updatedInsumo.id_ins),
                      "-> isUpdated:",
                      isUpdated,
                    );
                    return isUpdated ? updatedInsumo : insumo;
                  }),
                );
                console.log("Nueva lista de insumos:", insumos);
                setEditInsumo(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </ModulePageLayout>
  );
}
