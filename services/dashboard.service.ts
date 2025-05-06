export const SERVICIOS_DASHBOARD = {
  metricas: (fecha: string) =>
    `http://localhost:5000/dashboard/metricas?fecha=${fecha}`,
};
