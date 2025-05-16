export const SERVICIOS_PRODUCTOS = {
  categorias: "http://localhost:5000/categorias",
  productos: "http://localhost:5000/productos",
  inactivarProducto: (id: number) =>
    `http://localhost:5000/productos/inactivar/${id}`,
  activarProducto: (id: number) =>
    `http://localhost:5000/productos/activar/${id}`,
  actualizarProducto: (id: number) =>
    `http://localhost:5000/productos/${id}`,
};
