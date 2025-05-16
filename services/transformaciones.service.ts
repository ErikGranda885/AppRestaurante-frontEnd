export const SERVICIOS_TRANSFORMACIONES = {
  listar: "http://localhost:5000/transformaciones",
  crear: "http://localhost:5000/transformaciones",
  obtener: (id:number) => `http://localhost:5000/transformaciones/${id}`,
  actualizar: (id:number) => `http://localhost:5000/transformaciones/${id}`,
  eliminar: (id:number) => `http://localhost:5000/transformaciones/${id}`,
};
