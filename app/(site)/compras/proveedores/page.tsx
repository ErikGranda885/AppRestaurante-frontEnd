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
import { DEFAULT_PROVEEDOR_IMAGE_URL } from "@/lib/constants";
import { DialogExportarProveedores } from "@/components/shared/proveedores/ui/dialogExportarProveedores";
import { socket } from "@/lib/socket";
import Preloader from "@/components/shared/varios/preloader";

export default function Dashboard() {
  useProtectedRoute();
  const [abrirExportar, setAbrirExportar] = useState(false);
  const [proveedores, setProveedores] = React.useState<IProveedor[]>([]);
  const [showLoader, setShowLoader] = useState(true);
  const [abrirCrear, setAbrirCrear] = React.useState(false);
  const [abrirEditar, setAbrirEditar] = React.useState(false);
  const [proveedorEditando, setProveedorEditando] =
    React.useState<IProveedor | null>(null);
  const [estadoSeleccionado] = React.useState<string>("");
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

    const startTime = performance.now(); // ⏱️ Inicio

    fetch(servicio, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then(() => {
        const endTime = performance.now(); // ⏱️ Fin
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        setProveedores((prev) =>
          prev.map((p) =>
            p.id_prov === proveedor.id_prov
              ? { ...p, est_prov: nuevoEstado }
              : p,
          ),
        );

        ToastSuccess({
          message: `Se ha ${nuevoEstado === "Activo" ? "activado" : "inactivado"} el proveedor exitosamente en ${duration} segundos.`,
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
          <div className="relative h-8 w-8 overflow-hidden rounded-md border border-border bg-white p-[2px]">
            <Image
              src={row.original.img_prov || DEFAULT_PROVEEDOR_IMAGE_URL}
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
    {
      accessorKey: "cont_prov",
      header: "Contacto",
      cell: ({ row }) => {
        const contacto = (row.getValue("cont_prov") as string) ?? "";
        const contactoProtegido =
          contacto.length > 1 ? `${contacto[0]}*****` : "*****";

        return <div>{contactoProtegido}</div>;
      },
    },

    {
      accessorKey: "tel_prov",
      header: "Teléfono",
      cell: ({ row }) => {
        const telefono = (row.getValue("tel_prov") as string) ?? "";
        const longitud = telefono.length;
        const telefonoProtegido =
          longitud > 3 ? `*****${telefono.slice(-3)}` : "*****";

        return <div>{telefonoProtegido}</div>;
      },
    },

    { accessorKey: "direc_prov", header: "Dirección" },
    {
      accessorKey: "email_prov",
      header: "Correo",
      cell: ({ row }) => {
        const correo = (row.getValue("email_prov") as string) ?? "";
        let correoProtegido = "";

        if (correo.includes("@")) {
          const [usuario, dominio] = correo.split("@");
          correoProtegido =
            usuario.length > 1
              ? `${usuario[0]}*****@${dominio}`
              : `*****@${dominio}`;
        } else {
          correoProtegido = "*****";
        }

        return <div className="lowercase">{correoProtegido}</div>;
      },
    },

    {
      accessorKey: "ruc_prov",
      header: "RUC",
      cell: ({ row }) => {
        const ruc = (row.getValue("ruc_prov") as string) ?? "";
        const longitud = ruc.length;
        const rucProtegido = longitud > 4 ? `*****${ruc.slice(-4)}` : "*****";

        return <div>{rucProtegido}</div>;
      },
    },

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
            <DropdownMenuContent align="end" className="border-border">
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
                className="error-text focus:hover:error-text cursor-pointer"
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400); // puedes ajustar este valor si deseas

    return () => clearTimeout(timer);
  }, []);

  /* Cargar Proveedores */
  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const res = await fetch(SERVICIOS_PROVEEDORES.proveedores);
        if (!res.ok) throw new Error("Error al cargar proveedores");
        const data: IProveedor[] = await res.json();
        setProveedores(data);
      } catch (err) {
        console.error("Error al cargar proveedores:", err);
      }
    };

    cargarProveedores();

    socket.on("proveedores-actualizados", cargarProveedores);

    return () => {
      socket.off("proveedores-actualizados", cargarProveedores);
    };
  }, []);

  if (showLoader) return <Preloader />;
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

          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            {/* Botón: Añadir proveedor */}
            <div className="w-full md:w-auto">
              <GeneralDialog
                open={abrirCrear}
                onOpenChange={setAbrirCrear}
                triggerText={
                  <>
                    <Plus className="h-4 w-4 font-light" />
                    <span className="ml-1">Añadir nuevo proveedor</span>
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
            </div>

            {/* Buscador + Importar/Exportar en la misma fila */}
            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:flex-row md:items-center md:gap-3">
              {/* Buscador */}
              <div className="relative w-full sm:w-[250px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar proveedores"
                  className="w-full border border-border bg-white/10 pl-10 text-[12px]"
                  value={consultaBusqueda}
                  onChange={(e) => setConsultaBusqueda(e.target.value)}
                />
              </div>

              {/* Botones Importar/Exportar */}
              <div className="flex w-full gap-2 sm:w-auto sm:flex-row">
                <Button
                  className="w-full border-border text-[12px] font-semibold sm:w-auto"
                  variant="secondary"
                  onClick={() => setAbrirCargaMasiva(true)}
                >
                  <Upload className="h-4 w-4" /> Importar
                </Button>
                <Button
                  onClick={() => setAbrirExportar(true)}
                  className="w-full border-border text-[12px] font-semibold sm:w-auto"
                  variant="secondary"
                >
                  <CloudDownload className="h-4 w-4" /> Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
          <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
            <Card
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] xl:p-7 ${
                estadoSeleccionado === "" ? "ring-2 ring-secondary" : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between gap-2 p-0 sm:flex-row sm:items-center sm:gap-0">
                <div className="flex-1 space-y-2">
                  {/* Título visible solo en móvil */}
                  <div className="flex items-center justify-between sm:hidden">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Total de Proveedores
                    </CardTitle>
                    <TrendingUpIcon className="h-5 w-5 text-muted-foreground group-hover:scale-110" />
                  </div>

                  {/* Título visible solo en desktop */}
                  <div className="hidden sm:block">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Total de Proveedores
                    </CardTitle>
                  </div>

                  {/* Métricas */}
                  <div className="flex items-center gap-1 sm:gap-4">
                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                      {proveedores.length}
                    </span>
                    <span className="inline-block rounded-md bg-secondary px-2 py-1 text-xs font-semibold dark:bg-green-800/30">
                      +5%
                    </span>
                  </div>

                  <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Este mes
                  </CardDescription>
                </div>

                {/* Ícono en desktop */}
                <div className="mt-2 hidden items-center justify-center sm:mt-0 sm:flex">
                  <TrendingUpIcon className="h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>

            <Card
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] xl:p-7 ${
                estadoSeleccionado.toLowerCase() === "activo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between gap-2 p-0 sm:flex-row sm:items-center sm:gap-0">
                <div className="flex-1 space-y-2">
                  {/* Título en móviles */}
                  <div className="flex items-center justify-between sm:hidden">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Proveedores Activos
                    </CardTitle>
                    <UserCheck className="h-5 w-5 text-green-400 group-hover:scale-110" />
                  </div>

                  {/* Título en escritorio */}
                  <div className="hidden sm:block">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Proveedores Activos
                    </CardTitle>
                  </div>

                  {/* Valor y badge */}
                  <div className="flex items-center gap-1 sm:gap-4">
                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                      {
                        proveedores.filter(
                          (p) => p.est_prov.toLowerCase() === "activo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-600 dark:bg-green-800/30 dark:text-green-400">
                      +3%
                    </span>
                  </div>

                  <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Este mes
                  </CardDescription>
                </div>

                {/* Ícono en escritorio */}
                <div className="mt-2 hidden items-center justify-center sm:mt-0 sm:flex">
                  <UserCheck className="h-6 w-6 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>

            <Card
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] xl:p-7 ${
                estadoSeleccionado.toLowerCase() === "inactivo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between gap-2 p-0 sm:flex-row sm:items-center sm:gap-0">
                <div className="flex-1 space-y-2">
                  {/* Título en móvil */}
                  <div className="flex items-center justify-between sm:hidden">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Proveedores Inactivos
                    </CardTitle>
                    <UserX className="h-5 w-5 text-red-400 group-hover:scale-110" />
                  </div>

                  {/* Título en desktop */}
                  <div className="hidden sm:block">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Proveedores Inactivos
                    </CardTitle>
                  </div>

                  {/* Valor y badge */}
                  <div className="flex items-center gap-1 sm:gap-4">
                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                      {
                        proveedores.filter(
                          (p) => p.est_prov.toLowerCase() === "inactivo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-600 dark:bg-red-800/30 dark:text-red-400">
                      -2%
                    </span>
                  </div>

                  <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Este mes
                  </CardDescription>
                </div>

                {/* Ícono en escritorio */}
                <div className="mt-2 hidden items-center justify-center sm:mt-0 sm:flex">
                  <UserX className="h-6 w-6 text-red-400 transition-transform duration-300 group-hover:scale-110" />
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

        {abrirExportar && (
          <DialogExportarProveedores
            open={abrirExportar}
            onOpenChange={setAbrirExportar}
          />
        )}

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
      </>
    </ModulePageLayout>
  );
}
