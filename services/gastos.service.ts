export const SERVICIOS_GASTOS = {
  listar: "http://localhost:5000/gastos",
  crear: "http://localhost:5000/gastos",
  actualizar: (id: number) => `http://localhost:5000/gastos/${id}`,
  eliminar: (id: number) => `http://localhost:5000/gastos/${id}`,

  // Exportar reporte de gastos
  exportarGastosExcel: "http://localhost:5000/gastos/reporte/excel",
  exportarGastosPDF: "http://localhost:5000/gastos/reporte/pdf",
};
