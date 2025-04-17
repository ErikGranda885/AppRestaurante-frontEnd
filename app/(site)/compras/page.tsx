"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/varios/dataTable";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { MetricCard } from "@/components/shared/varios/metricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ICompra, IDetCompra } from "@/lib/types";
import { CloudDownload, Plus, Search, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ToastError } from "@/components/shared/toast/toastError";

export default function Page() {
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [consultaBusqueda, setConsultaBusqueda] = useState<string>("");
  const [compras, setCompras] = useState<ICompra[]>([]);
  const [detCompras, setDetCompras] = useState<IDetCompra[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  useProtectedRoute();
  const router = useRouter();

  // Cargar compras y detalles al iniciar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Llamada a la API de compras
        const resCompras = await fetch("http://localhost:5000/compras");
        const comprasData = await resCompras.json();
        console.log("Response de compras:", comprasData);
        // Verificamos si comprasData es un array o está envuelto en una propiedad "data"
        const comprasArray = Array.isArray(comprasData)
          ? comprasData
          : comprasData.data;
        setCompras(comprasArray || []);

        // Llamada a la API de detalles de compras
        const resDetCompras = await fetch("http://localhost:5000/dets_compras");
        const detComprasData = await resDetCompras.json();
        const detComprasArray = Array.isArray(detComprasData)
          ? detComprasData
          : detComprasData.data;
        setDetCompras(detComprasArray || []);
      } catch (error) {
        ToastError({
          message:
            "No se pudieron cargar las compras, comunicate con el administrador.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar las compras según la búsqueda (por ejemplo, por fecha o estado)
  const comprasFiltradas = compras.filter(
    (compra) =>
      compra.fech_comp.toLowerCase().includes(consultaBusqueda.toLowerCase()) ||
      compra.estado_comp.toLowerCase().includes(consultaBusqueda.toLowerCase()),
  );

  // Definir las columnas para el DataTable con renderizado personalizado
  const comprasColumnas = [
    {
      header: "ID",
      accessorKey: "id_comp",
      cell: ({ cell }: any) => `#${cell.getValue()}`,
    },
    /* Fecha de compra */
    {
      header: "Fecha de compra",
      accessorKey: "fech_comp",
      cell: ({ cell }: any) => {
        const dateVal = new Date(cell.getValue());
        const today = new Date();
        // Compara las fechas (sin tener en cuenta la hora) usando toDateString
        if (dateVal.toDateString() === today.toDateString()) {
          return `Hoy a las ${format(dateVal, "HH:mm")}`;
        } else {
          return format(dateVal, "dd/MM/yyyy HH:mm");
        }
      },
    },
    /* Total de la compra */
    {
      header: "Total",
      accessorKey: "tot_comp",
      cell: ({ cell }: any) => `$ ${parseFloat(cell.getValue()).toFixed(2)}`,
    },
    /* Estado de pago de compra */
    {
      header: "Estado de pago",
      accessorKey: "estado_pag_comp",
      cell: ({ cell }: any) => {
        const estado = cell.getValue().toLowerCase();
        let colorClass = "";
        if (estado === "pagado") {
          colorClass = "bg-green-100 text-green-700";
        } else if (estado === "pendiente") {
          colorClass = "bg-yellow-100 text-yellow-700";
        } else {
          colorClass = "bg-gray-100 text-gray-700";
        }
        return (
          <span className={`rounded px-2 py-1 ${colorClass}`}>
            {cell.getValue()}
          </span>
        );
      },
    },
    /* Estado de compra */
    {
      header: "Estado de compra",
      accessorKey: "estado_comp",
      cell: ({ cell }: any) => {
        const estado = cell.getValue().toLowerCase();
        let colorClass = "";
        if (estado === "pagado") {
          colorClass = "bg-green-100 text-green-700";
        } else if (estado === "pendiente") {
          colorClass = "bg-yellow-100 text-yellow-700";
        } else {
          colorClass = "bg-gray-100 text-gray-700";
        }
        return (
          <span className={`rounded px-2 py-1 ${colorClass}`}>
            {cell.getValue()}
          </span>
        );
      },
    },
    /* Usuario que realizó la compra */
    {
      header: "Usuario",
      accessorKey: "usu_comp",
      cell: ({ row }: any) => {
        const usuario = row.original.usu_comp;
        return (
          <div className="flex items-center">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image
                src={usuario.img_usu || "/default-usuario.png"}
                alt={usuario.nom_usu}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <div className="ml-2 flex flex-col">
              <p className="text-sm font-semibold">{usuario.nom_usu}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {usuario.rol_usu.nom_rol}
              </p>
            </div>
          </div>
        );
      },
    },
    /* Proveedor de la compra */
    {
      header: "Proveedor",
      accessorKey: "prov_comp",
      cell: ({ row }: any) => {
        const prov = row.original.prov_comp;
        return (
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image
                src={prov.img_prov || "/default-proveedor.png"}
                alt={prov.nom_prov}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <span>{prov.nom_prov}</span>
          </div>
        );
      },
    },
  ];

  // Calcular las métricas
  const volumenTotal = compras.reduce(
    (acc, compra) => acc + compra.tot_comp,
    0,
  );
  const numeroCompras = compras.length;
  const promedioItems =
    numeroCompras > 0 ? (detCompras.length / numeroCompras).toFixed(2) : "0";

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Compras"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={loadingData}
    >
      <div className="flex h-full w-full flex-col">
        {/* Encabezado con título, descripción y controles */}
        <div className="flex h-full w-full flex-col px-4">
          <h1 className="text-xl font-bold">Compras</h1>
          <p className="w-[500px] text-sm text-muted-foreground">
            Aquí puedes gestionar todas las compras realizadas en tu negocio.
          </p>
          <div className="pt-2">
            <div className="mb-5 flex items-center justify-between">
              <GeneralDialog
                open={abrirCrear}
                onOpenChange={setAbrirCrear}
                triggerText={
                  <>
                    <Plus className="h-4 w-4 font-light" /> Añade una nueva
                    compra
                  </>
                }
                title="Crear Nueva Compra"
                description="Ingresa la información para crear una nueva compra."
                submitText="Crear Compra"
              />
              <div className="flex items-center gap-3">
                {/* Input de búsqueda */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar compras..."
                    className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                    value={consultaBusqueda}
                    onChange={(e) => setConsultaBusqueda(e.target.value)}
                  />
                </div>
                {/* Botón para importar */}
                <Button
                  className="border-border text-[12px] font-semibold"
                  variant="secondary"
                >
                  <Upload className="h-4 w-4" /> Importar
                </Button>
                {/* Botón para exportar */}
                <Button
                  className="border-border text-[12px] font-semibold"
                  variant="secondary"
                >
                  <CloudDownload className="h-4 w-4" /> Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Sección de métricas y DataTable */}
        <div className="mx-4 h-full w-auto rounded-lg bg-[hsl(var(--card))]">
          {/* Métricas */}
          <div className="flex flex-col gap-4 pt-4">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div className="flex-1">
                <MetricCard
                  titulo="Volumen Total de Compras"
                  valor={`$ ${volumenTotal.toFixed(2)}`}
                  porcentaje=""
                  periodo="Total"
                  iconColor="text-green-400"
                  badgeColorClass="bg-green-100 dark:bg-green-800/30 text-green-500 dark:text-green-400"
                  onClick={() => {}}
                />
              </div>
              <div className="flex-1">
                <MetricCard
                  titulo="Número de Compras"
                  valor={numeroCompras.toString()}
                  porcentaje=""
                  periodo="Total"
                  iconColor="text-blue-400"
                  badgeColorClass="bg-blue-100 dark:bg-blue-800/30 text-blue-500 dark:text-blue-400"
                  onClick={() => {}}
                />
              </div>
              <div className="flex-1">
                <MetricCard
                  titulo="Ítems Promedio por Compra"
                  valor={promedioItems}
                  porcentaje=""
                  periodo="Promedio"
                  iconColor="text-purple-400"
                  badgeColorClass="bg-purple-100 dark:bg-purple-800/30 text-purple-500 dark:text-purple-400"
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
          {/* Tabla de Datos */}
          <div className="pb-4">
            <DataTable<ICompra>
              data={comprasFiltradas}
              columns={comprasColumnas}
              onRowClick={(compra: ICompra) => {
                router.push(`/compras/${compra.id_comp}`);
              }}
            />
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
