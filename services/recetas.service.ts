export const SERVICIOS_RECETAS = {
  listar:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/recetas",
  crear:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/recetas",
  actualizar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/recetas/${id}`,
  eliminar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/recetas/${id}`,
};
