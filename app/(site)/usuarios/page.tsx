"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable, DataUsers } from "@/components/shared/dataTable";
import {
  UserCheck,
  UserCog,
  Users,
  UserX,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Combobox, Option } from "@/components/shared/combobox";
import { GeneralDialog } from "@/components/shared/dialogGen";
import toast, { Toaster } from "react-hot-toast";
import { CreateUserForm } from "@/components/shared/users-comp/createUserForm";
import { EditUserForm } from "@/components/shared/users-comp/editUserForm";

export default function Page() {
  const [roleOptions, setRoleOptions] = React.useState<Option[]>([]);
  const [usuarios, setUsuarios] = React.useState<DataUsers[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editUserData, setEditUserData] = React.useState<DataUsers | null>(
    null
  );

  // Estados para filtro, edición y creación
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
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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
          (role: any) => role.est_rol === "Activo"
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
          (user) => user.estado?.toLowerCase() === selectedState.toLowerCase()
        );

  const handleCardClick = (estado: string) => {
    if (selectedState.toLowerCase() === estado.toLowerCase()) {
      setSelectedState("");
    } else {
      setSelectedState(estado);
    }
  };

  const cardClass = (estado: string) =>
    `bg-[hsl(var(--secondary))] flex items-center justify-start pl-6 dark:bg-[hsl(var(--card))] w-64 h-24 rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 ${
      selectedState.toLowerCase() === estado.toLowerCase()
        ? "ring-2 ring-[hsl(var(--secondary))] dark:ring-[hsl(var(--secondary))]"
        : ""
    }`;

  const renderHoverContent = (mensaje: string) => (
    <HoverCardContent className="w-60 p-3">
      <div className="flex items-center space-x-2">
        <Info className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <p className="text-sm text-gray-700 dark:text-gray-300">{mensaje}</p>
      </div>
    </HoverCardContent>
  );
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
          prev.map((u) => (u.id === user.id ? { ...u, estado: "Inactivo" } : u))
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
                  Se ha inactivado el usuario exitosamente.
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
          prev.map((u) => (u.id === user.id ? { ...u, estado: "Activo" } : u))
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
                  Se ha activado el usuario exitosamente.
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
        toast.error("Error al activar el usuario", { duration: 3000 });
        console.error("Error al activar usuario:", err);
      });
  };

  React.useEffect(() => {
    if (editUser) {
      setEditUserData(editUser);
    }
  }, [editUser]);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      <Toaster position="top-right" />
      <ModulePageLayout
        breadcrumbLinkTitle="Usuarios"
        breadcrumbPageTitle=""
        submenu={false}
        isLoading={false}
      >
        <div className="bg-[hsl(var(--card))] dark:bg-[hsl(var(--muted))] w-full h-full rounded-lg">
          {/* Tarjetas de filtro */}
          <div className="flex flex-row gap-3 justify-between px-6 pt-6">
            {/* Tarjeta: Usuarios Totales */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={cardClass("")}
                  onClick={() => handleCardClick("")}
                >
                  <div className="border-2 border-[#377cfb] p-2 rounded-full bg-[#CEE5FD] dark:bg-[#377cfb]/10 shadow-[0_0_10px_rgba(206,229,253,0.5)] dark:shadow-[0_0_10px_rgba(55,124,251,0.5)]">
                    <Users
                      className="text-[#377cfb]"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col pl-3">
                    <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Usuarios Totales
                    </h1>
                    <h3>{usuarios.length}</h3>
                  </div>
                </div>
              </HoverCardTrigger>
              {renderHoverContent("Muestra todos los usuarios.")}
            </HoverCard>

            {/* Tarjeta: Usuarios Activos */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={cardClass("Activo")}
                  onClick={() => handleCardClick("Activo")}
                >
                  <div className="border-2 p-2 rounded-full bg-[#B2E5C4] dark:bg-[#66cc8a]/10 shadow-[0_0_10px_rgba(178,229,196,0.5)] dark:shadow-[0_0_10px_rgba(102,204,138,0.5)] border-[#66cc8a]">
                    <UserCheck
                      className="text-[#66cc8a]"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col pl-3">
                    <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Usuarios Activos
                    </h1>
                    <h3>
                      {
                        usuarios.filter(
                          (user) => user.estado?.toLowerCase() === "activo"
                        ).length
                      }
                    </h3>
                  </div>
                </div>
              </HoverCardTrigger>
              {renderHoverContent("Filtra usuarios activos.")}
            </HoverCard>

            {/* Tarjeta: Usuarios Inactivos */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={cardClass("Inactivo")}
                  onClick={() => handleCardClick("Inactivo")}
                >
                  <div className="border-2 p-2 rounded-full bg-[#D3D1CB] dark:bg-[#485248]/10 shadow-[0_0_10px_rgba(211,209,203,0.5)] dark:shadow-[0_0_10px_rgba(72,82,72,0.5)] border-[#485248]">
                    <UserX
                      className="text-[#485248]"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col pl-3">
                    <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Usuarios Inactivos
                    </h1>
                    <h3>
                      {
                        usuarios.filter(
                          (user) => user.estado?.toLowerCase() === "inactivo"
                        ).length
                      }
                    </h3>
                  </div>
                </div>
              </HoverCardTrigger>
              {renderHoverContent("Filtra usuarios inactivos.")}
            </HoverCard>

            {/* Tarjeta: Usuarios Modificados */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className={cardClass("Modificado")}
                  onClick={() => handleCardClick("Modificado")}
                >
                  <div className="border-2 p-2 rounded-full bg-[#fff4cc] dark:bg-[#ffbe00]/10 shadow-[0_0_10px_rgba(255,244,204,0.5)] dark:shadow-[0_0_10px_rgba(255,190,0,0.5)] border-[#ffbe00]">
                    <UserCog
                      className="text-[#ffbe00]"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col pl-3">
                    <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Usuarios Modificados
                    </h1>
                    <h3>
                      {
                        usuarios.filter(
                          (user) => user.estado?.toLowerCase() === "modificado"
                        ).length
                      }
                    </h3>
                  </div>
                </div>
              </HoverCardTrigger>
              {renderHoverContent("Filtra usuarios modificados.")}
            </HoverCard>
          </div>

          <div className="flex justify-end px-6 pt-5 pb-9">
            <GeneralDialog
              open={openCreate}
              onOpenChange={setOpenCreate}
              triggerText="Nuevo Usuario"
              title="Crear Nuevo Usuario"
              description="Ingresa la información para crear un nuevo usuario."
              submitText="Crear Usuario"
            >
              <CreateUserForm
                roleOptions={roleOptions}
                onSuccess={(data: any) => {
                  const roleOption = roleOptions.find(
                    (option) => option.value === data.usuario.rol_usu.toString()
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
            <DataTable
              data={filteredUsers}
              onEdit={(user) => setEditUser(user)}
              onInactivar={handleInactivar}
              onActivar={handleActivar}
            />
          </div>
        </div>

        {editUser && (
          <Dialog
            open
            onOpenChange={(open) => {
              if (!open) setEditUser(null);
            }}
          >
            <DialogContent className="sm:max-w-[425px]">
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
                          option.value === data.usuario.rol_usu.toString()
                      )?.label || data.usuario.rol_usu.toString(),
                  };
                  setUsuarios((prev) =>
                    prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
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
