export const SERVICIOS_REPORTES = {
  ventasPorPeriodo: (
    tipo: "diario" | "semanal" | "mensual",
    desde?: string,
    hasta?: string,
  ) => {
    let url = `http://localhost:5000/ventas/reportes/ventas/periodo?tipo=${tipo}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return url;
  },

  // Opcional: rutas futuras para exportar Excel y PDF
  ventasPorPeriodoExcel: (
    tipo: "diario" | "semanal" | "mensual",
    desde?: string,
    hasta?: string,
  ) => {
    let url = `http://localhost:5000/ventas/reportes/ventas/periodo/excel?tipo=${tipo}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return url;
  },

  ventasPorPeriodoPDF: (
    tipo: "diario" | "semanal" | "mensual",
    desde?: string,
    hasta?: string,
  ) => {
    let url = `http://localhost:5000/ventas/reportes/ventas/periodo/pdf?tipo=${tipo}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return url;
  },
};
