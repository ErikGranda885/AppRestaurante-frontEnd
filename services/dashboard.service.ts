export const SERVICIOS_DASHBOARD = {
  metricas: (fecha: string) =>
    `https://apprestaurante-backend-production.up.railway.app/dashboard/metricas?fecha=${fecha}`,
  populares:
    "https://apprestaurante-backend-production.up.railway.app/productos/populares",
  porCaducar:
    "https://apprestaurante-backend-production.up.railway.app/inventario/caducar",
  ventasPorCategoria:
    "https://apprestaurante-backend-production.up.railway.app/ventas/categoria",
  ventasPorPeriodo:
    "https://apprestaurante-backend-production.up.railway.app/ventas/periodo",

  // Servicios específicos de ventas
  ultimasVentasRealizadas: (limit = 5) =>
    `https://apprestaurante-backend-production.up.railway.app/ventas/ultimas?limit=${limit}`,
  ventasPorTransferenciaPendientes:
    "https://apprestaurante-backend-production.up.railway.app/ventas/pagos-pendientes",
};
