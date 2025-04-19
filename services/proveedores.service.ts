export const SERVICIOS_PROVEEDORES = {
  proveedores: "http://localhost:5000/proveedores", // GET lista completa | POST crear uno nuevo
  obtenerProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/${id}`, // GET un proveedor por ID
  actualizarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/${id}`, // PUT actualizar un proveedor
  activarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/activar/${id}`, // PUT activar
  inactivarProveedor: (id: number | string) =>
    `http://localhost:5000/proveedores/inactivar/${id}`, // PUT inactivar
};
