export const SERVICIOS_DASHBOARD = {
  metricas: (fecha: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/dashboard/metricas?fecha=${fecha}`,
  populares:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/productos/populares",
  porCaducar:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/inventario/caducar",
  ventasPorCategoria:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/categoria",
  ventasPorPeriodo:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/periodo",

  // Servicios específicos de ventas
  ultimasVentasRealizadas: (limit = 5) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/ultimas?limit=${limit}`,
  ventasPorTransferenciaPendientes:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/pagos-pendientes",
};
