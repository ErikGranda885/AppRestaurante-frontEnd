"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/dataTable";
import {
  UserCheck,
  UserCog,
  UserX,
  CheckCircle,
  Upload,
  MoreHorizontal,
  TrendingUpIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Option } from "@/components/shared/combobox";
import { GeneralDialog } from "@/components/shared/dialogGen";
import toast, { Toaster } from "react-hot-toast";
import { CreateUserForm } from "@/components/shared/users-comp/createUserForm";
import { EditUserForm } from "@/components/shared/users-comp/editUserForm";
import { BulkUploadDialog } from "@/components/shared/users-comp/cargaUsers";
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
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type DataUsers = {
  id: string;
  usuario: string;
  correo: string;
  estado?: string;
  rol: string;
  rolNombre: string;
};

export default function Page() {
  const [roleOptions, setRoleOptions] = React.useState<Option[]>([]);
  const [usuarios, setUsuarios] = React.useState<DataUsers[]>([]);
  const [openBulkUpload, setOpenBulkUpload] = React.useState(false);
  const [selectedState, setSelectedState] = React.useState<string>("");
  const [editUser, setEditUser] = React.useState<DataUsers | null>(null);
  const [openCreate, setOpenCreate] = React.useState(false);

  // Cargar usuarios desde la API
  React.useEffect(() => {
    fetch("http://localhost:5000/usuarios")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar los usuarios");
        }
        return res.json();
      })
      .then((data: any[]) => {
        const transformed = data.map((item) => ({
          id: item.id_usu.toString(),
          usuario: item.nom_usu,
          correo: item.email_usu,
          estado: item.esta_usu,
          rol: item.rol_usu.id_rol.toString(),
          rolNombre: item.rol_usu.nom_rol,
        }));
        setUsuarios(transformed);
      })
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
      });
  }, []);

  const handleInactivar = (user: DataUsers) => {
    fetch(`http://localhost:5000/usuarios/inactivar/${user.id}`, {
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
            u.id === user.id ? { ...u, estado: "Inactivo" } : u,
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
                  Se ha inactivado el usuario exitosamente.
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
        toast.error("Error al inactivar el usuario", { duration: 3000 });
        console.error("Error al inactivar usuario:", err);
      });
  };
  const handleActivar = (user: DataUsers) => {
    fetch(`http://localhost:5000/usuarios/activar/${user.id}`, {
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
          prev.map((u) => (u.id === user.id ? { ...u, estado: "Activo" } : u)),
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
                  Se ha activado el usuario exitosamente.
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
        toast.error("Error al activar el usuario", { duration: 3000 });
        console.error("Error al activar usuario:", err);
      });
  };
  /* Definición de las columnas de la tabla */
  const userColumns: ColumnDef<DataUsers>[] = [
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
      header: () => <div className="text-right">Estado</div>,
      cell: ({ row }) => {
        const estado = String(row.getValue("estado")).toLowerCase();
        let estadoStyles = "border-gray-100 text-gray-100";
        if (estado === "activo") {
          estadoStyles =
            "px-3.5 success-text  border-[--success-per] dark:bg-[#377cfb]/10  ";
        } else if (estado === "inactivo") {
          estadoStyles = "px-2 error-text border-[--error-text]  ";
        }
        return (
          <div className="text-right font-medium">
            <span className={`rounded border py-1 ${estadoStyles}`}>
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
        const user = row.original;
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
                onClick={() => setEditUser(user)}
                className="cursor-pointer"
              >
                Editar
              </DropdownMenuItem>
              {String(user.estado).toLowerCase() === "inactivo" ? (
                <DropdownMenuItem
                  onClick={() => handleActivar(user)}
                  className="cursor-pointer"
                >
                  Activar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleInactivar(user)}
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
  // Cargar roles desde la API
  React.useEffect(() => {
    fetch("http://localhost:5000/roles")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar roles");
        }
        return res.json();
      })
      .then((data: any) => {
        const activeRoles = data.roles.filter(
          (role: any) => role.est_rol === "Activo",
        );
        const options: Option[] = activeRoles.map((role: any) => ({
          value: role.id_rol.toString(),
          label: role.nom_rol,
        }));
        setRoleOptions(options);
      })
      .catch((err) => console.error("Error al cargar roles:", err));
  }, []);
  // Filtrado de usuarios según estado
  const filteredUsers =
    selectedState === ""
      ? usuarios
      : usuarios.filter(
          (user) => user.estado?.toLowerCase() === selectedState.toLowerCase(),
        );

  const handleCardClick = (estado: string) => {
    if (selectedState.toLowerCase() === estado.toLowerCase()) {
      setSelectedState("");
    } else {
      setSelectedState(estado);
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
        <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#09090b]">
          <div className="grid grid-cols-1 gap-4 px-6 pt-6 md:grid-cols-4">
            {/* Tarjeta: Usuarios Totales */}
            <Card
              onClick={() => handleCardClick("")}
              className={`dark:border-border cursor-pointer transition-shadow hover:shadow-lg ${
                selectedState === "" ? "ring-2 ring-secondary" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">Usuarios Totales</CardTitle>
                <CardDescription className="text-sm">
                  {usuarios.length} usuarios
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <TrendingUpIcon className="h-5 w-5" />
              </CardFooter>
            </Card>

            {/* Tarjeta: Usuarios Activos */}
            <Card
              onClick={() => handleCardClick("Activo")}
              className={`dark:border-border cursor-pointer transition-shadow hover:shadow-lg ${
                selectedState.toLowerCase() === "activo"
                  ? "ring-2 ring-secondary"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">Usuarios Activos</CardTitle>
                <CardDescription className="text-sm">
                  {
                    usuarios.filter(
                      (user) => user.estado?.toLowerCase() === "activo",
                    ).length
                  }{" "}
                  activos
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <UserCheck className="success-text h-5 w-5" />
              </CardFooter>
            </Card>

            {/* Tarjeta: Usuarios Inactivos */}
            <Card
              onClick={() => handleCardClick("Inactivo")}
              className={`dark:border-border cursor-pointer transition-shadow hover:shadow-lg ${
                selectedState.toLowerCase() === "inactivo"
                  ? "ring-2 ring-secondary"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">Usuarios Inactivos</CardTitle>
                <CardDescription className="text-sm">
                  {
                    usuarios.filter(
                      (user) => user.estado?.toLowerCase() === "inactivo",
                    ).length
                  }{" "}
                  inactivos
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <UserX className="error-text h-5 w-5" />
              </CardFooter>
            </Card>

            {/* Tarjeta: Usuarios Modificados */}
            <Card
              onClick={() => handleCardClick("Modificado")}
              className={`dark:border-border cursor-pointer transition-shadow hover:shadow-lg ${
                selectedState.toLowerCase() === "modificado"
                  ? "ring-2 ring-secondary"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">Usuarios Modificados</CardTitle>
                <CardDescription className="text-sm">
                  {
                    usuarios.filter(
                      (user) => user.estado?.toLowerCase() === "modificado",
                    ).length
                  }{" "}
                  modificados
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <UserCog className="h-5 w-5 text-yellow-500" />
              </CardFooter>
            </Card>
          </div>

          {/* Diálogo para carga masiva */}
          {openBulkUpload && (
            <BulkUploadDialog
              roleOptions={roleOptions}
              onSuccess={(newUsers: any[]) => {
                const formattedUsers = newUsers.map((u: any) => ({
                  id: u.id_usu.toString(),
                  usuario: u.nom_usu,
                  correo: u.email_usu,
                  estado: u.esta_usu,
                  rol: u.rol_usu.toString(),
                  rolNombre:
                    roleOptions.find(
                      (option) => option.value === u.rol_usu.toString(),
                    )?.label || u.rol_usu.toString(),
                }));
                setUsuarios((prev) => [...prev, ...formattedUsers]);
              }}
              onClose={() => setOpenBulkUpload(false)}
            />
          )}

          {/* Crear Nuevo Usuario */}
          <div className="flex justify-end space-x-4 px-6 pb-4 pt-5">
            <Button onClick={() => setOpenBulkUpload(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>

            <GeneralDialog
              open={openCreate}
              onOpenChange={setOpenCreate}
              triggerText={<>Nuevo Usuario</>}
              title="Crear Nuevo Usuario"
              description="Ingresa la información para crear un nuevo usuario."
              submitText="Crear Usuario"
            >
              <CreateUserForm
                roleOptions={roleOptions}
                onSuccess={(data: any) => {
                  const roleOption = roleOptions.find(
                    (option) =>
                      option.value === data.usuario.rol_usu.toString(),
                  );
                  const createdUser: DataUsers = {
                    id: data.usuario.id_usu.toString(),
                    usuario: data.usuario.nom_usu,
                    correo: data.usuario.email_usu,
                    estado: data.usuario.esta_usu,
                    rol: data.usuario.rol_usu.toString(),
                    rolNombre: roleOption
                      ? roleOption.label
                      : data.usuario.rol_usu.toString(),
                  };
                  setUsuarios((prev) => [...prev, createdUser]);
                  setOpenCreate(false);
                }}
              />
            </GeneralDialog>
          </div>

          {/* Tabla */}
          <div className="px-6 pb-4">
            <DataTable<DataUsers> data={filteredUsers} columns={userColumns} />
          </div>
        </div>

        {/* Editar Usuario */}
        {editUser && (
          <Dialog
            open
            onOpenChange={(open) => {
              if (!open) setEditUser(null);
            }}
          >
            <DialogContent className="border-border">
              <DialogHeader>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogDescription>
                  Modifica la información del usuario.
                </DialogDescription>
              </DialogHeader>
              <EditUserForm
                initialData={{
                  id: editUser.id,
                  usuario: editUser.usuario,
                  correo: editUser.correo,
                  password: "",
                  rol: parseInt(editUser.rol),
                }}
                roleOptions={roleOptions}
                onSuccess={(data) => {
                  const updatedUser = {
                    id: data.usuario.id_usu.toString(),
                    usuario: data.usuario.nom_usu,
                    correo: data.usuario.email_usu,
                    estado: data.usuario.esta_usu,
                    rol: data.usuario.rol_usu.toString(),
                    rolNombre:
                      roleOptions.find(
                        (option) =>
                          option.value === data.usuario.rol_usu.toString(),
                      )?.label || data.usuario.rol_usu.toString(),
                  };
                  setUsuarios((prev) =>
                    prev.map((u) =>
                      u.id === updatedUser.id ? updatedUser : u,
                    ),
                  );
                  setEditUser(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </ModulePageLayout>
    </>
  );
}
