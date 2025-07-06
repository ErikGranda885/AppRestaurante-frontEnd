export const SERVICIOS_VENTAS = {
  // Obtener todas las ventas
  listarVentas:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/ventas",
  listarDetallesVentas:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/dets-ventas",
  // Obtener una venta por ID
  obtenerVenta: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/${id}`,

  // Crear una nueva venta
  crearVenta:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/ventas",

  // Actualizar venta
  actualizarVenta: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/${id}`,

  // Cambiar estado de una venta
  actualizarEstado: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/${id}/estado`,

  // Filtrar por estado
  filtrarPorEstado: (estado: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/estado?estado=${estado}`,

  // Filtrar por fecha
  filtrarPorFecha: (fecha: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/fecha?fecha=${fecha}`,

  // Filtrar por usuario
  filtrarPorUsuario: (idUsuario: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/usuario/${idUsuario}`,

  // Obtener ventas con detalles (formato tarjetas como el dashboard)
  ventasConDetalles:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/listado",

  // ✅ Nuevo: Total de ventas por fecha
  totalPorFecha: (fecha: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/ventas/total?fecha=${fecha}`,
};
