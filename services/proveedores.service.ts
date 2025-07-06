export const SERVICIOS_PROVEEDORES = {
  proveedores:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores",
  obtenerProveedorPorId: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/${id}`,
  obtenerProveedor: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/${id}`,
  actualizarProveedor: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/${id}`, // PUT actualizar un proveedor
  activarProveedor: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/activar/${id}`, // PUT activar
  inactivarProveedor: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/inactivar/${id}`, // PUT inactivar
  verificarRucProveedor: (ruc: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/verificar?ruc=${encodeURIComponent(ruc)}`,
  exportarProveedoresExcel:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/reporte/excel",
  exportarProveedoresPDF:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/reporte/pdf",
  cargarMasivoProv:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/masivo",
  generarPlantillaProv:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/proveedores/plantilla",
};
