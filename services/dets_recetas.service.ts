export const SERVICIOS_DET_RECETAS = {
  listarPorReceta: (idReceta: number) =>
    `https://apprestaurante-backend-production.up.railway.app/dets_recetas/por-receta/${idReceta}`,

  crear:
    "https://apprestaurante-backend-production.up.railway.app/dets_recetas",

  eliminar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/dets_recetas/${id}`,
};
