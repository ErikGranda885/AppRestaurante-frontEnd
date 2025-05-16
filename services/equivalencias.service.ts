export const SERVICIOS_EQUIVALENCIAS = {
  listar: "http://localhost:5000/equivalencias",
  crear: "http://localhost:5000/equivalencias",
  actualizar: (id: number) => `http://localhost:5000/equivalencias/${id}`,
  eliminar: (id: number) => `http://localhost:5000/equivalencias/${id}`,
  obtener: (id: number) => `http://localhost:5000/equivalencias/${id}`,
  porProducto: (id_prod: number) =>
    `http://localhost:5000/equivalencias/producto/${id_prod}`,
  activa: (id_prod: number) =>
    `http://localhost:5000/equivalencias/producto/${id_prod}/activa`,
};
