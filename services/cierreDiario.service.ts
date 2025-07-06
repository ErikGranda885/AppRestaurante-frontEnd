export const SERVICIOS_CIERRES = {
  // Crear un nuevo cierre manual
  crearCierre:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/cierres",

  // Registrar un depósito y cerrar el día
  registrarDeposito: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/cierres/${id}/deposito`,

  // Listar todos los cierres (acepta filtros ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&estado=)
  listarCierres:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/cierres",

  // Listar solo los cierres con estado 'por cerrar'
  listarPorCerrar:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/cierres/por-cerrar",

  // Obtener resumen de ventas, gastos y compras para una fecha específica
  resumenDelDia: (fecha: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/cierres/resumen/${fecha}`,

  // Obtener movimientos detallados del día
  movimientosDelDia: (fecha: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/cierres/movimientos/${fecha}`,

  // Buscar un cierre por ID
  buscarCierrePorId: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/cierres/${id}`,

  // Eliminar un cierre por ID
  eliminarCierre: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/cierres/${id}`,

  exportarCierresExcel:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/cierres/reporte/excel",
  exportarCierresPDF:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/cierres/reporte/pdf",
};
