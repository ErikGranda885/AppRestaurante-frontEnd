"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/dataTable";
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
import { GeneralDialog } from "@/components/shared/dialogGen";
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
import { CreateUserForm } from "@/components/shared/users-comp/createUserForm";
import { EditUserForm } from "@/components/shared/users-comp/editUserForm";
import { BulkUploadDialog } from "@/components/shared/users-comp/cargaUsers";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { IRol } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SERVICIOS } from "@/services/usuarios.service";
import { ModalModEstado } from "@/components/shared/Modales/modalModEstado";
// Importa el componente de diálogo generalizado para confirmar acciones

// Tipo de dato para los usuarios
export type DataUsers = {
  id: string;
  usuario: string;
  correo: string;
  estado?: string;
  rol: string;
  rolNombre: string;
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
  const [rolOpciones, setRolOpciones] = React.useState<IRol[]>([]);
  const [usuarios, setUsuarios] = React.useState<DataUsers[]>([]);
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

  // Cargar usuarios utilizando el servicio centralizado
  React.useEffect(() => {
    fetch(SERVICIOS.usuarios)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar los usuarios");
        }
        return res.json();
      })
      .then((data: any[]) => {
        const transformados = data.map((item) => ({
          id: item.id_usu.toString(),
          usuario: item.nom_usu,
          correo: item.email_usu,
          estado: item.esta_usu,
          rol: item.rol_usu.id_rol.toString(),
          rolNombre: item.rol_usu.nom_rol,
        }));
        setUsuarios(transformados);
      })
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
      });
  }, []);

  // Cargar roles utilizando el servicio centralizado
  React.useEffect(() => {
    fetch(SERVICIOS.roles)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar roles");
        }
        return res.json();
      })
      .then((data: any) => {
        const rolesData = Array.isArray(data) ? data : data.roles;
        if (!Array.isArray(rolesData)) {
          throw new Error("La respuesta de roles no es un arreglo");
        }
        const rolesActivos: IRol[] = rolesData.filter(
          (rol: any) => rol.est_rol === "Activo",
        );
        setRolOpciones(rolesActivos);
      })
      .catch((err) => {
        console.error("Error al cargar roles:", err);
      });
  }, []);

  // Función para inactivar un usuario (se llama después de confirmar la acción)
  const ejecutarInactivacion = (usuario: DataUsers) => {
    fetch(SERVICIOS.inactivarUsuario(usuario.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuario.id ? { ...u, estado: "Inactivo" } : u,
          ),
        );
        ToastSuccess({
          message: "Se ha inactivado el usuario exitosamente.",
        });
      })
      .catch((err) => {
        ToastError({
          message: `Error al inactivar el usuario: ${err.message}`,
        });
      });
  };

  // Función para activar un usuario (se llama después de confirmar la acción)
  const ejecutarActivacion = (usuario: DataUsers) => {
    fetch(SERVICIOS.activarUsuario(usuario.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuario.id ? { ...u, estado: "Activo" } : u,
          ),
        );
        ToastSuccess({
          message: "Se ha activado el usuario exitosamente.",
        });
      })
      .catch((err) => {
        ToastError({
          message: `Error al activar el usuario: ${err.message}`,
        });
      });
  };

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
  const columnasUsuarios: ColumnDef<DataUsers>[] = [
    {
      id: "id",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "usuario",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("usuario")}</div>
      ),
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
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("correo")}</div>
      ),
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

  // Filtrado de usuarios según estado y búsqueda
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const cumpleEstado =
      estadoSeleccionado === "" ||
      usuario.estado?.toLowerCase() === estadoSeleccionado.toLowerCase();
    const busqueda = consultaBusqueda.toLowerCase();
    const cumpleBusqueda =
      usuario.usuario.toLowerCase().includes(busqueda) ||
      usuario.correo.toLowerCase().includes(busqueda) ||
      usuario.rolNombre.toLowerCase().includes(busqueda);
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
        <div className="px-6 pt-2">
          <div className="mb-5 flex items-center justify-between">
            <GeneralDialog
              open={abrirCrear}
              onOpenChange={setAbrirCrear}
              triggerText={
                <>
                  <Plus className="h-4 w-4 font-light" /> Añadir nuevos usuarios
                </>
              }
              title="Crear Nuevo Usuario"
              description="Ingresa la información para crear un nuevo usuario."
              submitText="Crear Usuario"
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
                  };
                  setUsuarios((prev) => [...prev, usuarioCreado]);
                  setAbrirCrear(false);
                }}
                onRoleCreated={(nuevoRol: IRol) => {
                  setRolOpciones((prev) => [...prev, nuevoRol]);
                }}
              />
            </GeneralDialog>
            <div className="flex items-center gap-3">
              {/* Input para buscar */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar usuarios"
                  className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                  value={consultaBusqueda}
                  onChange={(e) => setConsultaBusqueda(e.target.value)}
                />
              </div>
              {/* Botón para importar */}
              <Button
                className="border-border text-[12px] font-semibold"
                variant="secondary"
                onClick={() => setAbrirCargaMasiva(true)}
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
        <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
          {/* Tarjetas de métricas */}
          <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
            {/* Tarjeta: Usuarios Totales */}
            <Card
              onClick={() => manejarClickTarjeta("")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                estadoSeleccionado === "" ? "ring-2 ring-secondary" : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Usuarios Totales
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {usuarios.length}
                    </span>
                    <span className="inline-block rounded-md bg-secondary px-2 py-1 text-sm font-bold dark:bg-green-800/30">
                      +12%
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
            {/* Tarjeta: Usuarios Activos */}
            <Card
              onClick={() => manejarClickTarjeta("Activo")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                estadoSeleccionado.toLowerCase() === "activo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Usuarios Activos
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {
                        usuarios.filter(
                          (u) => u.estado?.toLowerCase() === "activo",
                        ).length
                      }
                    </span>
                    <span className="inline-block rounded-md bg-green-100 px-2 py-1 text-sm font-bold text-green-500 dark:bg-green-800/30 dark:text-green-400">
                      +12%
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
            {/* Tarjeta: Usuarios Inactivos */}
            <Card
              onClick={() => manejarClickTarjeta("Inactivo")}
              className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
                estadoSeleccionado.toLowerCase() === "inactivo"
                  ? "ring-2 ring-secondary"
                  : ""
              } group`}
            >
              <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CardTitle className="text-sm font-light text-secondary-foreground">
                    Usuarios Inactivos
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-5">
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      {
                        usuarios.filter(
                          (u) => u.estado?.toLowerCase() === "inactivo",
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
                  <UserX className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Diálogo para carga masiva */}
          {abrirCargaMasiva && (
            <BulkUploadDialog
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
                  };
                });
                setUsuarios((prev) => [...prev, ...usuariosFormateados]);
              }}
              onClose={() => setAbrirCargaMasiva(false)}
            />
          )}

          {/* Tabla de usuarios */}
          <div className="px-6 pb-4">
            <DataTable<DataUsers>
              data={usuariosFiltrados}
              columns={columnasUsuarios}
            />
          </div>
        </div>

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
