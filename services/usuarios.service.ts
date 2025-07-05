export const SERVICIOS_USUARIOS = {
  // Obtención de usuarios
  usuarios: "https://apprestaurante-backend-production.up.railway.app/usuarios",
  // Obtención de roles
  roles: "https://apprestaurante-backend-production.up.railway.app/roles",

  cargarMasivo:
    "https://apprestaurante-backend-production.up.railway.app/usuarios/masivo",

  plantillaCargaMasiva:
    "https://apprestaurante-backend-production.up.railway.app/usuarios/plantilla",
  // Inactivar usuario (requiere el ID del usuario)
  inactivarUsuario: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/usuarios/inactivar/${id}`,
  // Activar usuario (requiere el ID del usuario)
  activarUsuario: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/usuarios/activar/${id}`,

  actualizarUsuario: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/usuarios/${id}`,
  verificarCorreoUsuario: (email: string) =>
    `https://apprestaurante-backend-production.up.railway.app/usuarios/verificar/correo?email=${encodeURIComponent(email)}`,
  // Exportar usuarios en Excel
  exportarExcel: `https://apprestaurante-backend-production.up.railway.app/usuarios/reporte/excel`,

  // Exportar usuarios en PDF
  exportarPDF: `https://apprestaurante-backend-production.up.railway.app/usuarios/reporte/pdf`,

  // Roles
  exportarRolesExcel:
    "https://apprestaurante-backend-production.up.railway.app/usuarios/reporte/rol/excel",
  exportarRolesPDF:
    "https://apprestaurante-backend-production.up.railway.app/usuarios/reporte/rol/pdf",
};
