export const SERVICIOS_VENTAS = {
  // Obtener todas las ventas
  listarVentas:
    "https://apprestaurante-backend-production.up.railway.app/ventas",
  listarDetallesVentas:
    "https://apprestaurante-backend-production.up.railway.app/dets-ventas",
  // Obtener una venta por ID
  obtenerVenta: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/ventas/${id}`,

  // Crear una nueva venta
  crearVenta: "https://apprestaurante-backend-production.up.railway.app/ventas",

  // Actualizar venta
  actualizarVenta: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/ventas/${id}`,

  // Cambiar estado de una venta
  actualizarEstado: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/ventas/${id}/estado`,

  // Filtrar por estado
  filtrarPorEstado: (estado: string) =>
    `https://apprestaurante-backend-production.up.railway.app/ventas/estado?estado=${estado}`,

  // Filtrar por fecha
  filtrarPorFecha: (fecha: string) =>
    `https://apprestaurante-backend-production.up.railway.app/ventas/fecha?fecha=${fecha}`,

  // Filtrar por usuario
  filtrarPorUsuario: (idUsuario: number) =>
    `https://apprestaurante-backend-production.up.railway.app/ventas/usuario/${idUsuario}`,

  // Obtener ventas con detalles (formato tarjetas como el dashboard)
  ventasConDetalles:
    "https://apprestaurante-backend-production.up.railway.app/ventas/listado",

  // ✅ Nuevo: Total de ventas por fecha
  totalPorFecha: (fecha: string) =>
    `https://apprestaurante-backend-production.up.railway.app/ventas/total?fecha=${fecha}`,
};
