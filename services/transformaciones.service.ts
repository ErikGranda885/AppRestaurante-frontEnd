export const SERVICIOS_TRANSFORMACIONES = {
  listar:
    "https://apprestaurante-backend-production.up.railway.app/transformaciones",
  crear:
    "https://apprestaurante-backend-production.up.railway.app/transformaciones",
  obtener: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/transformaciones/${id}`,
  actualizar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/transformaciones/${id}`,
  eliminar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/transformaciones/${id}`,
  porFecha: (fecha: string) =>
    `https://apprestaurante-backend-production.up.railway.app/transformaciones/porFecha/${fecha}`,
};
