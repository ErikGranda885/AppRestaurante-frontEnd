export const SERVICIOS_USUARIOS = {
  // Obtención de usuarios
  usuarios: "http://localhost:5000/usuarios",
  // Obtención de roles
  roles: "http://localhost:5000/roles",

  cargarMasivo: "http://localhost:5000/usuarios/masivo",

  plantillaCargaMasiva: "http://localhost:5000/usuarios/plantilla",
  // Inactivar usuario (requiere el ID del usuario)
  inactivarUsuario: (id: number | string) =>
    `http://localhost:5000/usuarios/inactivar/${id}`,
  // Activar usuario (requiere el ID del usuario)
  activarUsuario: (id: number | string) =>
    `http://localhost:5000/usuarios/activar/${id}`,

  actualizarUsuario: (id: number | string) =>
    `http://localhost:5000/usuarios/${id}`,

  // Exportar usuarios en Excel
  exportarExcel: `http://localhost:5000/usuarios/reporte/excel`,

  // Exportar usuarios en PDF
  exportarPDF: `http://localhost:5000/usuarios/reporte/pdf`,

  // Roles
  exportarRolesExcel: "http://localhost:5000/usuarios/reporte/rol/excel",
  exportarRolesPDF: "http://localhost:5000/usuarios/reporte/rol/pdf",
};
