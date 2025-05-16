export const SERVICIOS_RECETAS = {
  listar: "http://localhost:5000/recetas",
  crear: "http://localhost:5000/recetas",
  actualizar: (id: number) => `http://localhost:5000/recetas/${id}`,
  eliminar: (id: number) => `http://localhost:5000/recetas/${id}`,
};
