export const SERVICIOS_USUARIOS = {
  // Obtención de usuarios
  usuarios:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios",
  // Obtención de roles
  roles:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/roles",

  cargarMasivo:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/masivo",

  plantillaCargaMasiva:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/plantilla",
  // Inactivar usuario (requiere el ID del usuario)
  inactivarUsuario: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/inactivar/${id}`,
  // Activar usuario (requiere el ID del usuario)
  activarUsuario: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/activar/${id}`,

  actualizarUsuario: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/${id}`,
  verificarCorreoUsuario: (email: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/verificar/correo?email=${encodeURIComponent(email)}`,
  // Exportar usuarios en Excel
  exportarExcel: `https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/reporte/excel`,

  // Exportar usuarios en PDF
  exportarPDF: `https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/reporte/pdf`,

  // Roles
  exportarRolesExcel:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/reporte/rol/excel",
  exportarRolesPDF:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/usuarios/reporte/rol/pdf",
};
