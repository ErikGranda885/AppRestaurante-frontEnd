export const SERVICIOS_GASTOS = {
  listar: "https://apprestaurante-backend-production.up.railway.app/gastos",
  crear: "https://apprestaurante-backend-production.up.railway.app/gastos",
  actualizar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/gastos/${id}`,
  eliminar: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/gastos/${id}`,

  // Exportar reporte de gastos
  exportarGastosExcel:
    "https://apprestaurante-backend-production.up.railway.app/gastos/reporte/excel",
  exportarGastosPDF:
    "https://apprestaurante-backend-production.up.railway.app/gastos/reporte/pdf",
};
