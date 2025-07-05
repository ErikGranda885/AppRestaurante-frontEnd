export const SERVICIOS_EMPRESAS = {
  obtener: "https://apprestaurante-backend-production.up.railway.app/empresas",
  crear: "https://apprestaurante-backend-production.up.railway.app/empresas",
  actualizar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/empresas/${id}`,
};
