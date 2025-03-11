"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable, DataUsers } from "@/components/shared/dataTable";
import { UserCheck, UserCog, Users, UserX, Info } from "lucide-react";
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
import { CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Page() {
  const [roleOptions, setRoleOptions] = React.useState<Option[]>([]);
  // Estado para los usuarios que se cargarán de la API
  const [usuarios, setUsuarios] = React.useState<DataUsers[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editUserData, setEditUserData] = React.useState<DataUsers | null>(
    null
  );

  // Estados para filtro, edición y creación
  const [selectedState, setSelectedState] = React.useState<string>("");
  const [editUser, setEditUser] = React.useState<DataUsers | null>(null);
  // Estado para controlar la apertura del diálogo de creación
  const [openCreate, setOpenCreate] = React.useState(false);
  // Estado para el formulario de creación de usuario
  const [newUserData, setNewUserData] = React.useState({
    usuario: "",
    correo: "",
    password: "",
    rol: "",
  });
  // Estado para el combobox en el modal de edición (rol)
  const [rol, setRol] = React.useState("");

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
  /* Cargar roles desde la api */
  React.useEffect(() => {
    fetch("http://localhost:5000/roles")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar roles");
        }
        return res.json();
      })
      .then((data: any) => {
        // Suponiendo que la API retorna { message, roles: [ ... ] }
        // y que un rol activo es aquel con est_rol === ""
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

  // Clase para las tarjetas de filtro
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

  // Función para crear un nuevo usuario (POST)
  const handleCreateUser = () => {
    // Verifica que todos los campos tengan datos (puedes agregar más validaciones)
    if (
      !newUserData.usuario ||
      !newUserData.correo ||
      !newUserData.password ||
      !newUserData.rol
    ) {
      console.error("Faltan datos en el formulario");
      return;
    }

    const payload = {
      nom_usu: newUserData.usuario,
      email_usu: newUserData.correo,
      clave_usu: newUserData.password,
      rol_usu: parseInt(newUserData.rol) || 0, // Asegúrate de que este valor sea correcto
    };

    console.log("Payload a enviar:", payload);

    fetch("http://localhost:5000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data: any) => {
        console.log("Respuesta de la API:", data);
        const roleOption = roleOptions.find(
          (option) => option.value === data.usuario.rol_usu.toString()
        );
        const createdUser: DataUsers = {
          id: data.usuario.id_usu,
          usuario: data.usuario.nom_usu,
          correo: data.usuario.email_usu,
          estado: data.usuario.esta_usu,
          rol: data.usuario.rol_usu.toString(), // Guarda el id del rol
          rolNombre: roleOption
            ? roleOption.label
            : data.usuario.rol_usu.toString(), // Guarda el nombre en un campo aparte
        };

        setUsuarios((prev) => [...prev, createdUser]);
        setNewUserData({ usuario: "", correo: "", password: "", rol: "" });
        setOpenCreate(false);
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } relative flex w-96 items-start gap-3 p-4 bg-[#F0FFF4] border border-[#4ADE80] rounded-lg shadow-lg`}
              style={{ animationDuration: "3s" }}
            >
              {/* Ícono más grande */}
              <CheckCircle className="w-6 h-6 text-[#166534] mt-1" />

              {/* Contenido de texto */}
              <div className="flex-1">
                <p className="text-[#166534] text-sm font-semibold">
                  Mensaje Informativo
                </p>
                <p className="text-sm text-[#166534]/80">
                  Se ha agregado un nuevo usuario exitosamente.
                </p>
              </div>

              {/* Barra de progreso en la parte inferior */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          {
            duration: 2000,
            position: "top-right",
          }
        );
      })

      .catch((err) => console.error("Error en fetch:", err));
  };

  // Función para editar usuario (simulación)
  const handleSubmitEdit = () => {
    if (!editUserData) return;
    const payload = {
      nom_usu: editUserData.usuario,
      email_usu: editUserData.correo,
      rol_usu: parseInt(editUserData.rol) || 0,
    };

    fetch(`http://localhost:5000/usuarios/${editUserData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data: any) => {
        // Inserta aquí el código para transformar el rol
        const roleOption = roleOptions.find(
          (option) => option.value === editUserData.rol
        );
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === editUserData.id
              ? {
                  ...editUserData,
                  rolNombre: roleOption ? roleOption.label : editUserData.rol,
                }
              : u
          )
        );

        setEditUser(null);
        setEditUserData(null);
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } relative flex w-96 items-start gap-3 p-4 bg-[#F0FFF4] border border-[#4ADE80] rounded-lg shadow-lg`}
              style={{ animationDuration: "3s" }}
            >
              {/* Ícono más grande */}
              <CheckCircle className="w-6 h-6 text-[#166534] mt-1" />

              {/* Contenido de texto */}
              <div className="flex-1">
                <p className="text-[#166534] text-sm font-semibold">
                  Mensaje Informativo
                </p>
                <p className="text-sm text-[#166534]/80">
                  Se ha actualizado el usuario exitosamente.
                </p>
              </div>

              {/* Barra de progreso en la parte inferior */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          {
            duration: 2000,
            position: "top-right",
          }
        );
      })
      .catch((err) => console.error("Error en PUT:", err));
  };

  // Actualizar el estado del rol cuando se abra el modal de edición
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

          {/* Diálogo para crear nuevo usuario */}
          <div className="flex justify-end px-6 pt-5 pb-9">
            <GeneralDialog
              open={openCreate}
              onOpenChange={setOpenCreate}
              triggerText="Nuevo Usuario"
              title="Crear Nuevo Usuario"
              description="Ingresa la información para crear un nuevo usuario."
              submitText="Crear Usuario"
              onSubmit={handleCreateUser}
            >
              {/* Contenido del formulario */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="usuario"
                  className="text-right"
                >
                  Nombre
                </Label>
                <Input
                  id="usuario"
                  value={newUserData.usuario}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      usuario: e.target.value,
                    })
                  }
                  placeholder="Nombre del usuario"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="correo"
                  className="text-right"
                >
                  Correo
                </Label>
                <Input
                  id="correo"
                  value={newUserData.correo}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, correo: e.target.value })
                  }
                  placeholder="usuario@ejemplo.com"
                  className="col-span-3"
                />
              </div>
              {/* Campo para contraseña */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="password"
                  className="text-right"
                >
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Contraseña"
                  className="col-span-3"
                />
              </div>
              {/* Combobox para seleccionar Rol */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="rol"
                  className="text-right"
                >
                  Rol
                </Label>
                <div className="col-span-3">
                  <Combobox
                    items={roleOptions}
                    value={newUserData.rol}
                    onChange={(value) =>
                      setNewUserData({ ...newUserData, rol: value })
                    }
                    placeholder="Selecciona un rol"
                  />
                </div>
              </div>
            </GeneralDialog>
          </div>

          {/* Tabla */}
          <div className="px-6 pb-4">
            <DataTable
              data={filteredUsers}
              onEdit={(user) => setEditUser(user)}
            />
          </div>
        </div>

        {/* Modal para editar usuario */}
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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-usuario"
                    className="text-right"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="edit-usuario"
                    value={editUserData?.usuario || ""}
                    onChange={(e) =>
                      setEditUserData({
                        ...editUserData!,
                        usuario: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-correo"
                    className="text-right"
                  >
                    Correo
                  </Label>
                  <Input
                    id="edit-correo"
                    value={editUserData?.correo || ""}
                    onChange={(e) =>
                      setEditUserData({
                        ...editUserData!,
                        correo: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-rol"
                    className="text-right"
                  >
                    Rol
                  </Label>
                  <div className="col-span-3">
                    <Combobox
                      items={roleOptions}
                      value={editUserData?.rol || ""}
                      onChange={(value) =>
                        setEditUserData({ ...editUserData!, rol: value })
                      }
                      placeholder="Selecciona un rol"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSubmitEdit}
                >
                  Guardar cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </ModulePageLayout>
    </>
  );
}
