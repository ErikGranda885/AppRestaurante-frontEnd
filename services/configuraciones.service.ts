export const SERVICIOS_CONFIGURACIONES = {
  listar: "http://localhost:5000/configuraciones",
  obtenerPorClave: (clave: string) => `http://localhost:5000/configuraciones/${clave}`,
  actualizarPorClave: (clave: string) => `http://localhost:5000/configuraciones/${clave}`,
};
