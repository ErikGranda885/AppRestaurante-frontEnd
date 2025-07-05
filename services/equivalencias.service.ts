export const SERVICIOS_EQUIVALENCIAS = {
  listar:
    "https://apprestaurante-backend-production.up.railway.app/equivalencias",
  crear:
    "https://apprestaurante-backend-production.up.railway.app/equivalencias",
  actualizar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/equivalencias/${id}`,
  eliminar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/equivalencias/${id}`,
  obtener: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/equivalencias/${id}`,
  porProducto: (id_prod: number) =>
    `https://apprestaurante-backend-production.up.railway.app/equivalencias/producto/${id_prod}`,
  activa: (id_prod: number) =>
    `https://apprestaurante-backend-production.up.railway.app/equivalencias/producto/${id_prod}/activa`,
};
