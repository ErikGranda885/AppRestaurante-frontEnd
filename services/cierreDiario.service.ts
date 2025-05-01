export const SERVICIOS_CIERRES = {
  // Listar todos los cierres (puede aceptar ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD)
  listarCierres: "http://localhost:5000/cierres",

  // Listar solo los cierres pendientes
  listarPendientes: "http://localhost:5000/cierres/pendientes",

  // Listar solo los cierres pendientes
  listarPorCerrar: "http://localhost:5000/cierres/por-cerrar",

  // Listar solo los cierres cerrados
  listarCerrados: "http://localhost:5000/cierres/cerrados",

  // Crear un nuevo cierre
  crearCierre: "http://localhost:5000/cierres",

  // Obtener un resumen de ventas/gastos/compras para una fecha
  resumenDelDia: (fecha: string) =>
    `http://localhost:5000/cierres/resumen/${fecha}`,

  // Obtener movimientos (ventas, gastos, compras) del día
  movimientosDelDia: (fecha: string) =>
    `http://localhost:5000/cierres/movimientos/${fecha}`,

  // Buscar un cierre específico por ID
  buscarCierrePorId: (id: number | string) =>
    `http://localhost:5000/cierres/${id}`,

  // Eliminar un cierre
  eliminarCierre: (id: number | string) =>
    `http://localhost:5000/cierres/${id}`,
};
