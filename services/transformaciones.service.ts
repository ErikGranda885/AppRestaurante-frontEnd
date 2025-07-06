export const SERVICIOS_TRANSFORMACIONES = {
  listar:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/transformaciones",
  crear:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/transformaciones",
  obtener: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/transformaciones/${id}`,
  actualizar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/transformaciones/${id}`,
  eliminar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/transformaciones/${id}`,
  porFecha: (fecha: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/transformaciones/porFecha/${fecha}`,
};
