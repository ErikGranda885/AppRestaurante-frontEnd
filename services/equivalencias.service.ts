export const SERVICIOS_EQUIVALENCIAS = {
  listar:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/equivalencias",
  crear:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/equivalencias",
  actualizar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/equivalencias/${id}`,
  eliminar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/equivalencias/${id}`,
  obtener: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/equivalencias/${id}`,
  porProducto: (id_prod: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/equivalencias/producto/${id_prod}`,
  activa: (id_prod: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/equivalencias/producto/${id_prod}/activa`,
};
