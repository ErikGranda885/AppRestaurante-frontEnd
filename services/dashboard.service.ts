export const SERVICIOS_DASHBOARD = {
  metricas: (fecha: string) =>
    `http://localhost:5000/dashboard/metricas?fecha=${fecha}`,
  populares: "http://localhost:5000/productos/populares",
  porCaducar: "http://localhost:5000/inventario/caducar",
};
