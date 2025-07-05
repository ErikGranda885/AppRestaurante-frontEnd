export const SERVICIOS_RECETAS = {
  listar: "https://apprestaurante-backend-production.up.railway.app/recetas",
  crear: "https://apprestaurante-backend-production.up.railway.app/recetas",
  actualizar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/recetas/${id}`,
  eliminar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/recetas/${id}`,
};
