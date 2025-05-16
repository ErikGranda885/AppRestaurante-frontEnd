export const SERVICIOS_DET_RECETAS = {
  listarPorReceta: (idReceta: number) =>
    `http://localhost:5000/dets_recetas/por-receta/${idReceta}`,

  crear: "http://localhost:5000/dets_recetas",

  eliminar: (id: number) => `http://localhost:5000/dets_recetas/${id}`,
};
