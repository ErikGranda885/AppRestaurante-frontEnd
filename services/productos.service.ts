export const SERVICIOS_PRODUCTOS = {
  categorias: "http://localhost:5000/categorias",
  productos: "http://localhost:5000/productos",

  inactivarProducto: (id: number) =>
    `http://localhost:5000/productos/inactivar/${id}`,

  activarProducto: (id: number) =>
    `http://localhost:5000/productos/activar/${id}`,

  actualizarProducto: (id: number) => `http://localhost:5000/productos/${id}`,

  // 🔽 Rutas para exportación general
  exportarProductosJson: (tipo: string) =>
    `http://localhost:5000/productos/reportes/json?tipo=${tipo}`,

  exportarProductosExcel: (tipo: string) =>
    `http://localhost:5000/productos/reportes/excel?tipo=${tipo}`,

  exportarProductosPDF: (tipo: string) =>
    `http://localhost:5000/productos/reportes/pdf?tipo=${tipo}`,

  // 🔽 Reporte específico: Insumos con equivalencias
  exportarReporteInsumos: (desde?: string, hasta?: string) => {
    let url = "http://localhost:5000/productos/reporte-insumos";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  // 🔽 Reporte de Directos y Transformados con rango de fechas
  exportarReporteDirectosTransformados: (desde?: string, hasta?: string) => {
    let url = "http://localhost:5000/productos/reporte-directos-transformados";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },
};
