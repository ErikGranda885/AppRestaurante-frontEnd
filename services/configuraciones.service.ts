export const SERVICIOS_CONFIGURACIONES = {
  listar:
    "https://apprestaurante-backend-production.up.railway.app/configuraciones",
  obtenerPorClave: (clave: string) =>
    `https://apprestaurante-backend-production.up.railway.app/configuraciones/${clave}`,
  actualizarPorClave: (clave: string) =>
    `https://apprestaurante-backend-production.up.railway.app/configuraciones/${clave}`,
};
