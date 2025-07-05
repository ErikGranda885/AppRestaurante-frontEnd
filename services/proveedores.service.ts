export const SERVICIOS_PROVEEDORES = {
  proveedores:
    "https://apprestaurante-backend-production.up.railway.app/proveedores",
  obtenerProveedorPorId: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/proveedores/${id}`,
  obtenerProveedor: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/proveedores/${id}`,
  actualizarProveedor: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/proveedores/${id}`, // PUT actualizar un proveedor
  activarProveedor: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/proveedores/activar/${id}`, // PUT activar
  inactivarProveedor: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/proveedores/inactivar/${id}`, // PUT inactivar
  verificarRucProveedor: (ruc: string) =>
    `https://apprestaurante-backend-production.up.railway.app/proveedores/verificar?ruc=${encodeURIComponent(ruc)}`,
  exportarProveedoresExcel:
    "https://apprestaurante-backend-production.up.railway.app/proveedores/reporte/excel",
  exportarProveedoresPDF:
    "https://apprestaurante-backend-production.up.railway.app/proveedores/reporte/pdf",
  cargarMasivoProv:
    "https://apprestaurante-backend-production.up.railway.app/proveedores/masivo",
  generarPlantillaProv:
    "https://apprestaurante-backend-production.up.railway.app/proveedores/plantilla",
};
