"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/varios/dataTable";
import {
  MoreHorizontal,
  Upload,
  TrendingUpIcon,
  UserCheck,
  UserX,
  Plus,
  Search,
  CloudDownload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CreateUserForm } from "@/components/shared/usuarios/formularios/createUserForm";
import { EditUserForm } from "@/components/shared/usuarios/formularios/editUserForm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { IRol } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ModalModEstado } from "@/components/shared/Modales/modalModEstado";
import { BulkUploadUsersDialog } from "@/components/shared/usuarios/formularios/cargaUsers";
import Image from "next/image";
import { parse } from "date-fns";
import { DEFAULT_USER_URL } from "@/lib/constants";
import { DialogExportarUsuariosRoles } from "@/components/shared/usuarios/ui/DialogExportarUsuariosRoles";
import { useAccionesUsuario } from "@/hooks/usuarios/useAccionesUsuario";
import { useUsuariosAndRoles } from "@/hooks/usuarios/useUsuariosAndRoles";
import Preloader from "@/components/shared/varios/preloader";

export type DataUsers = {
  id: string;
  usuario: string;
  correo: string;
  estado?: string;
  rol: string;
  rolNombre: string;
  img_usu?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
};

// Tipo para definir la acción a confirmar (activar o inactivar)
type TipoAccion = "activar" | "inactivar";

// En el objeto de acción, se almacena el id, el nombre del usuario y el tipo de acción
type AccionUsuario = {
  id: string;
  usuario: string;
  tipo: TipoAccion;
};

export default function PaginaUsuarios() {
  // Estados
  const [openDialogExportar, setOpenDialogExportar] = React.useState(false);
  const {
    usuarios,
    setUsuarios,
    roles: rolOpciones,
    setRoles: setRolOpciones,
    loading,
    error,
    refetchUsuarios,
  } = useUsuariosAndRoles();
  const [showLoader, setShowLoader] = React.useState(true);
  const {
    activarUsuario: ejecutarActivacion,
    inactivarUsuario: ejecutarInactivacion,
  } = useAccionesUsuario(setUsuarios);

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const nuevosEsteMes = usuarios.filter(
    (u) =>
      u.fechaCreacion &&
      u.fechaCreacion.getMonth() === mesActual &&
      u.fechaCreacion.getFullYear() === anioActual,
  ).length;

  const inactivosEsteMes = usuarios.filter(
    (u) =>
      u.estado?.toLowerCase() === "inactivo" &&
      u.fechaActualizacion &&
      u.fechaActualizacion.getMonth() === mesActual &&
      u.fechaActualizacion.getFullYear() === anioActual,
  ).length;

  const activosEsteMes = usuarios.filter(
    (u) =>
      u.estado?.toLowerCase() === "activo" &&
      u.fechaActualizacion &&
      u.fechaActualizacion.getMonth() === mesActual &&
      u.fechaActualizacion.getFullYear() === anioActual,
  ).length;

  const [abrirCargaMasiva, setAbrirCargaMasiva] = React.useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] =
    React.useState<string>("");
  const [usuarioEditar, setUsuarioEditar] = React.useState<DataUsers | null>(
    null,
  );
  const [abrirCrear, setAbrirCrear] = React.useState(false);
  const [consultaBusqueda, setConsultaBusqueda] = React.useState<string>("");

  // Estado para la acción de confirmar (activar o inactivar)
  const [accionUsuario, setAccionUsuario] =
    React.useState<AccionUsuario | null>(null);

  useProtectedRoute();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);
  if (loading || showLoader) return <Preloader />;
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6">
        <div className="rounded-lg border border-red-400 bg-red-50 p-6 text-center dark:border-red-600 dark:bg-red-900/20">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Error al cargar los usuarios
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Verifica tu conexión con el servidor o intenta nuevamente.
          </p>
          <button
            onClick={refetchUsuarios}
            className="mt-4 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Función general para confirmar la acción seleccionada (activar/inactivar)
  const confirmarAccion = async () => {
    if (!accionUsuario) return;

    // Buscar el usuario en el listado
    const usuario = usuarios.find((u) => u.id === accionUsuario.id);
    if (!usuario) return;

    if (accionUsuario.tipo === "inactivar") {
      ejecutarInactivacion(usuario);
    } else {
      ejecutarActivacion(usuario);
    }

    setAccionUsuario(null);
  };

  /* Definición de las columnas de la tabla */
  const usuariosColumnas: ColumnDef<DataUsers>[] = [
    {
      accessorKey: "usuario",
      header: "Usuario",
      cell: ({ row }) => {
        const nombre = row.getValue("usuario") as string;
        const inicial = nombre.charAt(0).toUpperCase();
        const imagen = row.original.img_usu as string;

        return (
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-border bg-white">
              <Image
                src={imagen || DEFAULT_USER_URL}
                alt="usuario"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-medium capitalize">{inicial}. Usuario</span>
          </div>
        );
      },
    },

    {
      accessorKey: "correo",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Correo
        </Button>
      ),
      cell: ({ row }) => {
        const correo = row.getValue("correo") as string | undefined;
        const [usuario, dominio] =
          correo && correo.includes("@") ? correo.split("@") : ["", ""];
        const correoProtegido =
          usuario.length > 1
            ? `${usuario[0]}*****@${dominio}`
            : `*****@${dominio}`;

        return <div className="lowercase">{correoProtegido}</div>;
      },
    },
    {
      accessorKey: "rolNombre",
      header: () => <div className="text-right">Rol</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.getValue("rolNombre")}
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: () => <div className="text-center">Estado</div>,
      cell: ({ row }) => {
        const estadoOriginal = String(row.getValue("estado")) || "";
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
        const usuario = row.original;
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
                onClick={() => setUsuarioEditar(usuario)}
                className="cursor-pointer"
              >
                Editar
              </DropdownMenuItem>
              {String(usuario.estado).toLowerCase() === "inactivo" ? (
                <DropdownMenuItem
                  onClick={() =>
                    setAccionUsuario({
                      id: usuario.id,
                      usuario: usuario.usuario,
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
                    setAccionUsuario({
                      id: usuario.id,
                      usuario: usuario.usuario,
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

  // Filtrado de usuarios según estado y búsqueda
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const cumpleEstado =
      estadoSeleccionado === "" ||
      usuario.estado?.toLowerCase() === estadoSeleccionado.toLowerCase();
    const busqueda = consultaBusqueda.toLowerCase();
    const cumpleBusqueda =
      (usuario.usuario ?? "").toLowerCase().includes(busqueda) ||
      (usuario.correo ?? "").toLowerCase().includes(busqueda) ||
      (usuario.rolNombre ?? "").toLowerCase().includes(busqueda);

    return cumpleEstado && cumpleBusqueda;
  });

  // Función para cambiar el filtro por estado (para las tarjetas)
  const manejarClickTarjeta = (estado: string) => {
    if (estadoSeleccionado.toLowerCase() === estado.toLowerCase()) {
      setEstadoSeleccionado("");
    } else {
      setEstadoSeleccionado(estado);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <ModulePageLayout
        breadcrumbLinkTitle="Usuarios"
        breadcrumbPageTitle=""
        submenu={false}
        isLoading={false}
      >
        <div className="h-full w-full space-y-5 rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
          {/* Encabezado + filtros */}
          <div className="px-4 pt-6 sm:px-6">
            <h1 className="text-xl font-bold">Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              Aquí puedes gestionar los usuarios de tu negocio.
            </p>

            <div className="mb-5 mt-4 flex gap-2 sm:flex-row sm:items-center sm:justify-between">
              <GeneralDialog
                open={abrirCrear}
                onOpenChange={setAbrirCrear}
                title="Crear Nuevo Usuario"
                description="Ingresa la información para crear un nuevo usuario."
                submitText="Crear Usuario"
                triggerText={
                  <>
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="ml-1 sm:hidden">Nuevo usuario</span>
                    <span className="ml-1 hidden sm:inline">
                      Añadir nuevo usuario
                    </span>
                  </>
                }
              >
                <CreateUserForm
                  roleOptions={rolOpciones}
                  onSuccess={(data: any) => {
                    const rolData = data.usuario.rol_usu;
                    const usuarioCreado: DataUsers = {
                      id: data.usuario.id_usu.toString(),
                      usuario: data.usuario.nom_usu,
                      correo: data.usuario.email_usu,
                      estado: data.usuario.esta_usu,
                      rol: rolData.id_rol.toString(),
                      rolNombre: rolData.nom_rol,
                      img_usu: data.usuario.img_usu || "",
                      fechaCreacion: parse(
                        data.usuario.crea_en_usu,
                        "dd-MM-yyyy HH:mm:ss",
                        new Date(),
                      ),
                      fechaActualizacion: parse(
                        data.usuario.act_en_usu,
                        "dd-MM-yyyy HH:mm:ss",
                        new Date(),
                      ),
                    };
                    setUsuarios((prev) => [...prev, usuarioCreado]);
                    setAbrirCrear(false);
                  }}
                  onRoleCreated={(nuevoRol: IRol) => {
                    setRolOpciones((prev) => [...prev, nuevoRol]);
                  }}
                />
              </GeneralDialog>

              <div className="flex gap-2 sm:flex-row sm:items-center">
                <div className="relative sm:w-auto">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar Usuarios"
                    className="w-full border border-border bg-white/10 pl-8 text-xs sm:w-[160px] md:w-[180px] lg:w-[200px]"
                    value={consultaBusqueda}
                    onChange={(e) => setConsultaBusqueda(e.target.value)}
                  />
                </div>

                <Button
                  className="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:text-sm sm:font-semibold"
                  variant="secondary"
                  onClick={() => setAbrirCargaMasiva(true)}
                >
                  <Upload className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Importar</span>
                </Button>

                <Button
                  className="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:text-sm sm:font-semibold"
                  variant="secondary"
                  onClick={() => setOpenDialogExportar(true)}
                >
                  <CloudDownload className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Exportar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-3 lg:grid-cols-3 xl:px-6">
            {/* Tarjeta: Usuarios Totales */}
            <Card
              onClick={() => manejarClickTarjeta("")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] xl:p-7 ${
                estadoSeleccionado === "" ? "ring-2 ring-secondary" : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between gap-2 p-0 sm:flex-row sm:items-center sm:gap-0">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between sm:hidden">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Usuarios Totales
                    </CardTitle>
                    <TrendingUpIcon className="h-5 w-5 text-muted-foreground group-hover:scale-110" />
                  </div>
                  <div className="hidden sm:block">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Usuarios Totales
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-4">
                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                      {usuarios.length}
                    </span>
                    <span className="inline-block rounded-md bg-secondary px-2 py-1 text-xs font-semibold dark:bg-green-800/30">
                      {activosEsteMes > 0
                        ? `+${activosEsteMes} nuevos usuarios`
                        : activosEsteMes}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-2 hidden items-center justify-center sm:mt-0 sm:flex">
                  <TrendingUpIcon className="h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>

            {/* Tarjeta: Usuarios Activos */}
            <Card
              onClick={() => manejarClickTarjeta("Activo")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                estadoSeleccionado.toLowerCase() === "activo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between gap-2 p-0 sm:flex-row sm:items-center sm:gap-0">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between sm:hidden">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Usuarios Activos
                    </CardTitle>
                    <UserCheck className="h-5 w-5 text-green-500 group-hover:scale-110" />
                  </div>
                  <div className="hidden sm:block">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Usuarios Activos
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-4">
                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                      {
                        usuarios.filter(
                          (u) => u.estado?.toLowerCase() === "activo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-500 dark:bg-green-800/30 dark:text-green-400">
                      {nuevosEsteMes > 0 ? `+${nuevosEsteMes}` : nuevosEsteMes}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-2 hidden items-center justify-center sm:mt-0 sm:flex">
                  <UserCheck className="h-6 w-6 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>

            {/* Tarjeta: Usuarios Inactivos */}
            <Card
              onClick={() => manejarClickTarjeta("Inactivo")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] xl:p-7 ${
                estadoSeleccionado.toLowerCase() === "inactivo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between gap-2 p-0 sm:flex-row sm:items-center sm:gap-0">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between sm:hidden">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Usuarios Inactivos
                    </CardTitle>
                    <UserX className="h-5 w-5 text-muted-foreground group-hover:scale-110" />
                  </div>
                  <div className="hidden sm:block">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">
                      Usuarios Inactivos
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-4">
                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                      {
                        usuarios.filter(
                          (u) => u.estado?.toLowerCase() === "inactivo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-red-100 px-2 py-1 text-xs font-semibold dark:bg-red-800/30">
                      {inactivosEsteMes > 0
                        ? `-${inactivosEsteMes}`
                        : inactivosEsteMes}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Este mes
                  </CardDescription>
                </div>
                <div className="mt-2 hidden items-center justify-center sm:mt-0 sm:flex">
                  <UserX className="h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Tabla */}
          <div className="w-full px-4 pb-6 sm:px-6">
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm dark:bg-[#1a1a1a]">
              <DataTable<DataUsers>
                data={usuariosFiltrados}
                columns={usuariosColumnas}
              />
            </div>
          </div>
        </div>

        {/* Diálogo para carga masiva */}
        {abrirCargaMasiva && (
          <BulkUploadUsersDialog
            roleOptions={rolOpciones}
            onSuccess={(nuevosUsuarios: any[]) => {
              const usuariosFormateados = nuevosUsuarios.map((u: any) => {
                let idRol = "";
                let nombreRol = "";
                if (typeof u.rol_usu === "object") {
                  idRol = u.rol_usu.id_rol.toString();
                  nombreRol = u.rol_usu.nom_rol;
                } else {
                  idRol = u.rol_usu.toString();
                  nombreRol = u.rol_usu.toString();
                }
                return {
                  id: u.id_usu.toString(),
                  usuario: u.nom_usu,
                  correo: u.email_usu,
                  estado: u.esta_usu,
                  rol: idRol,
                  rolNombre: nombreRol,
                  img_usu: u.img_usu || "",
                };
              });
              setUsuarios((prev) => [...prev, ...usuariosFormateados]);
            }}
            onClose={() => setAbrirCargaMasiva(false)}
          />
        )}

        {/* Diálogo para editar usuario */}
        {usuarioEditar && (
          <Dialog
            open
            onOpenChange={(abierto) => {
              if (!abierto) setUsuarioEditar(null);
            }}
          >
            <DialogContent className="border-border sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogDescription>
                  Modifica la información del usuario.
                </DialogDescription>
              </DialogHeader>
              <EditUserForm
                initialData={{
                  id: usuarioEditar.id,
                  usuario: usuarioEditar.usuario,
                  correo: usuarioEditar.correo,
                  password: "",
                  rol: parseInt(usuarioEditar.rol),
                  img_usu: usuarioEditar.img_usu,
                }}
                roleOptions={rolOpciones.map((role: IRol) => ({
                  value: role.id_rol.toString(),
                  label: role.nom_rol,
                }))}
                onSuccess={(data) => {
                  const usuarioActualizado: DataUsers = {
                    id: data.usuario.id_usu.toString(),
                    usuario: data.usuario.nom_usu,
                    correo: data.usuario.email_usu,
                    estado: data.usuario.esta_usu,
                    rol: data.usuario.rol_usu.toString(),
                    rolNombre:
                      rolOpciones.find(
                        (opcion) =>
                          opcion.id_rol.toString() ===
                          data.usuario.rol_usu.toString(),
                      )?.nom_rol || data.usuario.rol_usu.toString(),
                    img_usu: data.usuario.img_usu || "",
                    fechaCreacion: parse(
                      data.usuario.crea_en_usu,
                      "dd-MM-yyyy HH:mm:ss",
                      new Date(),
                    ),
                    fechaActualizacion: parse(
                      data.usuario.act_en_usu,
                      "dd-MM-yyyy HH:mm:ss",
                      new Date(),
                    ),
                  };
                  setUsuarios((prev) =>
                    prev.map((u) =>
                      u.id === usuarioActualizado.id ? usuarioActualizado : u,
                    ),
                  );
                  setUsuarioEditar(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        <DialogExportarUsuariosRoles
          open={openDialogExportar}
          onOpenChange={setOpenDialogExportar}
        />
      </ModulePageLayout>

      {/* Diálogo de confirmación para activar/inactivar usuario */}
      {accionUsuario && (
        <ModalModEstado
          abierto={true}
          onCambioAbierto={(abierto) => {
            if (!abierto) setAccionUsuario(null);
          }}
          tipoAccion={accionUsuario.tipo}
          nombreElemento={accionUsuario.usuario}
          onConfirmar={confirmarAccion}
        />
      )}

      <Toaster position="top-right" />
    </>
  );
}
