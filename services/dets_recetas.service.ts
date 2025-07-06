export const SERVICIOS_DET_RECETAS = {
  listarPorReceta: (idReceta: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/dets_recetas/por-receta/${idReceta}`,

  crear:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/dets_recetas",

  eliminar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/dets_recetas/${id}`,
};
