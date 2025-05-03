export const SERVICIOS_CIERRES = {
  // Crear un nuevo cierre manual
  crearCierre: "http://localhost:5000/cierres",

  // Registrar un depósito y cerrar el día
  registrarDeposito: (id: number | string) =>
    `http://localhost:5000/cierres/${id}/deposito`,

  // Listar todos los cierres (acepta filtros ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&estado=)
  listarCierres: "http://localhost:5000/cierres",

  // Listar solo los cierres con estado 'por cerrar'
  listarPorCerrar: "http://localhost:5000/cierres/por-cerrar",

  // Obtener resumen de ventas, gastos y compras para una fecha específica
  resumenDelDia: (fecha: string) =>
    `http://localhost:5000/cierres/resumen/${fecha}`,

  // Obtener movimientos detallados del día
  movimientosDelDia: (fecha: string) =>
    `http://localhost:5000/cierres/movimientos/${fecha}`,

  // Buscar un cierre por ID
  buscarCierrePorId: (id: number | string) =>
    `http://localhost:5000/cierres/${id}`,

  // Eliminar un cierre por ID
  eliminarCierre: (id: number | string) =>
    `http://localhost:5000/cierres/${id}`,
};
