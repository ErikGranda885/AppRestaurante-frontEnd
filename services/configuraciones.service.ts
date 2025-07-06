export const SERVICIOS_CONFIGURACIONES = {
  listar:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/configuraciones",
  obtenerPorClave: (clave: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/configuraciones/${clave}`,
  actualizarPorClave: (clave: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/configuraciones/${clave}`,
};
