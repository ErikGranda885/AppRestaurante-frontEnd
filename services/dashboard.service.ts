export const SERVICIOS_DASHBOARD = {
  metricas: (fecha: string) =>
    `http://localhost:5000/dashboard/metricas?fecha=${fecha}`,
  populares: "http://localhost:5000/productos/populares",
  porCaducar: "http://localhost:5000/inventario/caducar",
  ventasPorCategoria: "http://localhost:5000/ventas/categoria",
  ventasPorPeriodo: "http://localhost:5000/ventas/periodo",

  // Servicios específicos de ventas
  ultimasVentasRealizadas: (limit = 5) =>
    `http://localhost:5000/ventas/ultimas?limit=${limit}`,
  ventasPorTransferenciaPendientes:
    "http://localhost:5000/ventas/pagos-pendientes",
};
