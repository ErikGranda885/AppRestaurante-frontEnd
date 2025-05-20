export const SERVICIOS_PROVEEDORES = {
  proveedores: "http://localhost:5000/proveedores", // GET lista completa | POST crear uno nuevo
  obtenerProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/${id}`,
  actualizarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/${id}`, // PUT actualizar un proveedor
  activarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/activar/${id}`, // PUT activar
  inactivarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/inactivar/${id}`, // PUT inactivar

  exportarProveedoresExcel: "http://localhost:5000/proveedores/reporte/excel",
  exportarProveedoresPDF: "http://localhost:5000/proveedores/reporte/pdf",
};
