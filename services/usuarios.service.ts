export const SERVICIOS = {
  // Obtención de usuarios
  usuarios: "http://localhost:5000/usuarios",
  // Obtención de roles
  roles: "http://localhost:5000/roles",
  // Inactivar usuario (requiere el ID del usuario)
  inactivarUsuario: (id: number | string) =>
    `http://localhost:5000/usuarios/inactivar/${id}`,
  // Activar usuario (requiere el ID del usuario)
  activarUsuario: (id: number | string) =>
    `http://localhost:5000/usuarios/activar/${id}`,
};
