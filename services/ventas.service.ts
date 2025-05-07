export const SERVICIOS_VENTAS = {
  // Obtener todas las ventas
  listarVentas: "http://localhost:5000/ventas",

  // Obtener una venta por ID
  obtenerVenta: (id: number) => `http://localhost:5000/ventas/${id}`,

  // Crear una nueva venta
  crearVenta: "http://localhost:5000/ventas",

  // Actualizar venta
  actualizarVenta: (id: number) => `http://localhost:5000/ventas/${id}`,

  // Cambiar estado de una venta
  actualizarEstado: (id: number) => `http://localhost:5000/ventas/${id}/estado`,

  // Filtrar por estado
  filtrarPorEstado: (estado: string) =>
    `http://localhost:5000/ventas/estado?estado=${estado}`,

  // Filtrar por fecha
  filtrarPorFecha: (fecha: string) =>
    `http://localhost:5000/ventas/fecha?fecha=${fecha}`,

  // Filtrar por usuario
  filtrarPorUsuario: (idUsuario: number) =>
    `http://localhost:5000/ventas/usuario/${idUsuario}`,

  // Obtener ventas con detalles (formato tarjetas como el dashboard)
  ventasConDetalles: "http://localhost:5000/ventas/listado",
};
