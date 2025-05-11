export const SERVICIOS_EMPRESAS = {
  obtener: "http://localhost:5000/empresas",
  crear: "http://localhost:5000/empresas",
  actualizar: (id: number) => `http://localhost:5000/empresas/${id}`,
};
