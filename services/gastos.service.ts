export const SERVICIOS_GASTOS = {
  listar:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/gastos",
  crear:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/gastos",
  actualizar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/gastos/${id}`,
  eliminar: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/gastos/${id}`,

  // Exportar reporte de gastos
  exportarGastosExcel:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/gastos/reporte/excel",
  exportarGastosPDF:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/gastos/reporte/pdf",
};
