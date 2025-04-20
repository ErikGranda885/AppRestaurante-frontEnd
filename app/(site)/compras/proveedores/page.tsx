"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  CloudDownload,
  Plus,
  Search,
  TrendingUpIcon,
  Upload,
  UserCheck,
  UserX,
  MoreHorizontal,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { IProveedor } from "@/lib/types";
import { DataTable } from "@/components/shared/varios/dataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { SERVICIOS_PROVEEDORES } from "@/services/proveedores.service";
import Image from "next/image";
import { CreateProveedorForm } from "@/components/shared/proveedores/formularios/createProveedorForm";
import { EditProveedorForm } from "@/components/shared/proveedores/formularios/editProveedorForm";
import { ToastError } from "@/components/shared/toast/toastError";
import { ModalModEstado } from "@/components/shared/Modales/modalModEstado";
import { BulkUploadProveedoresDialog } from "@/components/shared/proveedores/formularios/cargaProveedores";

export default function Dashboard() {
  useProtectedRoute();
  const [proveedores, setProveedores] = React.useState<IProveedor[]>([]);
  const [abrirCrear, setAbrirCrear] = React.useState(false);
  const [abrirEditar, setAbrirEditar] = React.useState(false);
  const [proveedorEditando, setProveedorEditando] =
    React.useState<IProveedor | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] =
    React.useState<string>("");
  const [consultaBusqueda, setConsultaBusqueda] = React.useState<string>("");
  const [accionProveedor, setAccionProveedor] = React.useState<{
    id: string;
    nombre: string;
    tipo: "activar" | "inactivar";
  } | null>(null);
  const [abrirCargaMasiva, setAbrirCargaMasiva] = useState(false);

  const ejecutarCambioEstado = (
    proveedor: IProveedor,
    nuevoEstado: "Activo" | "Inactivo",
  ) => {
    const servicio =
      nuevoEstado === "Activo"
        ? SERVICIOS_PROVEEDORES.activarProveedor(proveedor.id_prov)
        : SERVICIOS_PROVEEDORES.inactivarProveedor(proveedor.id_prov);

    fetch(servicio, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setProveedores((prev) =>
          prev.map((p) =>
            p.id_prov === proveedor.id_prov
              ? { ...p, est_prov: nuevoEstado }
              : p,
          ),
        );
        ToastSuccess({
          message: `Se ha ${nuevoEstado === "Activo" ? "activado" : "inactivado"} el proveedor exitosamente.`,
        });
      })
      .catch((err) => {
        ToastError({
          message: `Error al ${nuevoEstado === "Activo" ? "activar" : "inactivar"} el proveedor: ${err.message}`,
        });
      });
  };

  const confirmarAccion = () => {
    if (!accionProveedor) return;
    const proveedor = proveedores.find(
      (p) => p.id_prov.toString() === accionProveedor.id,
    );
    if (!proveedor) return;
    ejecutarCambioEstado(
      proveedor,
      accionProveedor.tipo === "activar" ? "Activo" : "Inactivo",
    );
    setAccionProveedor(null);
  };
  const proveedoresFiltrados = proveedores.filter((prov) => {
    const cumpleEstado =
      estadoSeleccionado === "" ||
      prov.est_prov.toLowerCase() === estadoSeleccionado.toLowerCase();
    const busqueda = consultaBusqueda.toLowerCase();
    const cumpleBusqueda =
      prov.nom_prov.toLowerCase().includes(busqueda) ||
      prov.email_prov.toLowerCase().includes(busqueda) ||
      prov.ruc_prov.includes(busqueda);
    return cumpleEstado && cumpleBusqueda;
  });

  const columnas: ColumnDef<IProveedor>[] = [
    {
      accessorKey: "nom_prov",
      header: "Proveedor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-gray-300 bg-white p-[2px] dark:border-gray-600">
            <Image
              src={
                row.original.img_prov ||
                "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/proveedores%2Fproveedor-defecto.png?alt=media&token=91f55bd4-862b-488b-ae86-29c10199a7c8"
              }
              alt="proveedor"
              fill
              className="object-cover"
            />
          </div>
          <span
            className="max-w-[140px] truncate font-medium capitalize"
            title={row.getValue("nom_prov")}
          >
            {row.getValue("nom_prov")}
          </span>
        </div>
      ),
    },
    { accessorKey: "cont_prov", header: "Contacto" },
    { accessorKey: "tel_prov", header: "Teléfono" },
    { accessorKey: "direc_prov", header: "Dirección" },
    { accessorKey: "email_prov", header: "Correo" },
    { accessorKey: "ruc_prov", header: "RUC" },
    {
      accessorKey: "est_prov",
      header: () => <div className="text-center">Estado</div>,
      cell: ({ row }) => {
        const estadoOriginal = String(row.getValue("est_prov")) || "";
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
      cell: ({ row }) => {
        const proveedor = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setProveedorEditando(proveedor);
                  setAbrirEditar(true);
                }}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  setAccionProveedor({
                    id: proveedor.id_prov.toString(),
                    nombre: proveedor.nom_prov,
                    tipo:
                      proveedor.est_prov.toLowerCase() === "activo"
                        ? "inactivar"
                        : "activar",
                  })
                }
              >
                {proveedor.est_prov.toLowerCase() === "activo"
                  ? "Inactivar"
                  : "Activar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  /* Cargar Proveedores */
  useEffect(() => {
    fetch(SERVICIOS_PROVEEDORES.proveedores)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar proveedores");
        return res.json();
      })
      .then((data: IProveedor[]) => {
        setProveedores(data);
      })
      .catch((err) => {
        console.error("Error al cargar proveedores:", err);
      });
  }, []);

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Compras"
      breadcrumbPageTitle="Gestión de Proveedores"
      submenu={true}
      isLoading={false}
    >
      <>
        <Toaster position="top-right" />
        <div className="px-6 pt-2">
          <h1 className="text-xl font-bold">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Aquí puedes gestionar los proveedores de tu negocio.
          </p>
          <div className="pt-4" />
          <div className="mb-5 flex items-center justify-between">
            <GeneralDialog
              open={abrirCrear}
              onOpenChange={setAbrirCrear}
              triggerText={
                <>
                  <Plus className="h-4 w-4 font-light" /> Añadir nuevo proveedor
                </>
              }
              title="Crear Nuevo Proveedor"
              description="Ingresa la información para crear un nuevo proveedor."
              contentClassName="w-[600px] max-w-none"
            >
              <CreateProveedorForm
                onSuccess={(nuevoProveedor) => {
                  setAbrirCrear(false);
                  setProveedores((prev) => [...prev, nuevoProveedor]);
                }}
              />
            </GeneralDialog>

            {proveedorEditando && (
              <GeneralDialog
                open={abrirEditar}
                onOpenChange={setAbrirEditar}
                title="Editar Proveedor"
                description="Actualiza la información del proveedor seleccionado."
                contentClassName="w-[600px] max-w-none"
              >
                <EditProveedorForm
                  initialData={{
                    id: String(proveedorEditando.id_prov),
                    nombre: proveedorEditando.nom_prov,
                    contacto: proveedorEditando.cont_prov,
                    telefono: proveedorEditando.tel_prov,
                    direccion: proveedorEditando.direc_prov,
                    email: proveedorEditando.email_prov,
                    ruc: proveedorEditando.ruc_prov,
                    img_prov: proveedorEditando.img_prov,
                  }}
                  onSuccess={(proveedorActualizado) => {
                    setAbrirEditar(false);
                    setProveedorEditando(null);
                    setProveedores((prev) =>
                      prev.map((prov) =>
                        prov.id_prov === proveedorActualizado.id_prov
                          ? proveedorActualizado
                          : prov,
                      ),
                    );
                  }}
                />
              </GeneralDialog>
            )}

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar proveedores"
                  className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                  value={consultaBusqueda}
                  onChange={(e) => setConsultaBusqueda(e.target.value)}
                />
              </div>
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
        </div>

        <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
          <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
            <Card
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                estadoSeleccionado === "" ? "ring-2 ring-secondary" : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Total de Proveedores
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {proveedores.length}
                    </span>
                    <span className="inline-block rounded-md bg-secondary px-2 py-1 text-sm font-bold dark:bg-green-800/30">
                      +5%
                    </span>
                  </div>
                  <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                  <TrendingUpIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>

            <Card
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                estadoSeleccionado.toLowerCase() === "activo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Proveedores Activos
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {
                        proveedores.filter(
                          (p) => p.est_prov.toLowerCase() === "activo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-green-100 px-2 py-1 text-sm font-bold text-green-500 dark:bg-green-800/30 dark:text-green-400">
                      +3%
                    </span>
                  </div>
                  <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                  <UserCheck className="h-7 w-7 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>

            <Card
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                estadoSeleccionado.toLowerCase() === "inactivo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Proveedores Inactivos
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {
                        proveedores.filter(
                          (p) => p.est_prov.toLowerCase() === "inactivo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-red-100 px-2 py-1 text-sm font-bold dark:bg-red-800/30">
                      -2%
                    </span>
                  </div>
                  <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                  <UserX className="h-7 w-7 text-red-400 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Tabla */}
          <div className="px-6 pb-4">
            <DataTable<IProveedor>
              data={proveedoresFiltrados}
              columns={columnas}
            />
          </div>
        </div>
        {accionProveedor && (
          <ModalModEstado
            abierto={true}
            onCambioAbierto={(abierto) => {
              if (!abierto) setAccionProveedor(null);
            }}
            tipoAccion={accionProveedor.tipo}
            nombreElemento={accionProveedor.nombre}
            onConfirmar={confirmarAccion}
          />
        )}

        {abrirCargaMasiva && (
          <BulkUploadProveedoresDialog
            onSuccess={(nuevos) => {
              setProveedores((prev) => [...prev, ...nuevos]);
              setAbrirCargaMasiva(false);
            }}
            onClose={() => setAbrirCargaMasiva(false)}
          />
        )}
      </>
    </ModulePageLayout>
  );
}
