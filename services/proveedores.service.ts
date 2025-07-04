export const SERVICIOS_PROVEEDORES = {
  proveedores: "http://localhost:5000/proveedores",
  obtenerProveedorPorId: (id: number | string) =>
    `http://localhost:5000/proveedores/${id}`,
  obtenerProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/${id}`,
  actualizarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/${id}`, // PUT actualizar un proveedor
  activarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/activar/${id}`, // PUT activar
  inactivarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/inactivar/${id}`, // PUT inactivar
  verificarRucProveedor: (ruc: string) =>
    `http://localhost:5000/proveedores/verificar?ruc=${encodeURIComponent(ruc)}`,
  exportarProveedoresExcel: "http://localhost:5000/proveedores/reporte/excel",
  exportarProveedoresPDF: "http://localhost:5000/proveedores/reporte/pdf",
  cargarMasivoProv: "http://localhost:5000/proveedores/masivo",
  generarPlantillaProv: "http://localhost:5000/proveedores/plantilla",
};
