export const SERVICIOS_CIERRES = {
  // Listar todos los cierres
  listarCierres: "http://localhost:5000/cierres",

  // Crear un nuevo cierre
  crearCierre: "http://localhost:5000/cierres",

  // Obtener un resumen de ventas/gastos/compras para una fecha
  resumenDelDia: (fecha: string) =>
    `http://localhost:5000/cierres/resumen/${fecha}`,

  // Buscar un cierre específico por ID
  buscarCierrePorId: (id: number | string) =>
    `http://localhost:5000/cierres/${id}`,

  // Eliminar un cierre
  eliminarCierre: (id: number | string) =>
    `http://localhost:5000/cierres/${id}`,

  // Obtener movimientos (ventas, gastos, compras) del día
  movimientosDelDia: (fecha: string) =>
    `http://localhost:5000/cierres/movimientos/${fecha}`,
};
