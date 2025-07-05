export const SERVICIOS_CIERRES = {
  // Crear un nuevo cierre manual
  crearCierre:
    "https://apprestaurante-backend-production.up.railway.app/cierres",

  // Registrar un depósito y cerrar el día
  registrarDeposito: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/cierres/${id}/deposito`,

  // Listar todos los cierres (acepta filtros ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&estado=)
  listarCierres:
    "https://apprestaurante-backend-production.up.railway.app/cierres",

  // Listar solo los cierres con estado 'por cerrar'
  listarPorCerrar:
    "https://apprestaurante-backend-production.up.railway.app/cierres/por-cerrar",

  // Obtener resumen de ventas, gastos y compras para una fecha específica
  resumenDelDia: (fecha: string) =>
    `https://apprestaurante-backend-production.up.railway.app/cierres/resumen/${fecha}`,

  // Obtener movimientos detallados del día
  movimientosDelDia: (fecha: string) =>
    `https://apprestaurante-backend-production.up.railway.app/cierres/movimientos/${fecha}`,

  // Buscar un cierre por ID
  buscarCierrePorId: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/cierres/${id}`,

  // Eliminar un cierre por ID
  eliminarCierre: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/cierres/${id}`,

  exportarCierresExcel:
    "https://apprestaurante-backend-production.up.railway.app/cierres/reporte/excel",
  exportarCierresPDF:
    "https://apprestaurante-backend-production.up.railway.app/cierres/reporte/pdf",
};
