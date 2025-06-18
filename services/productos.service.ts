export const SERVICIOS_PRODUCTOS = {
  categorias: "http://localhost:5000/categorias",
  productos: "http://localhost:5000/productos",
  obtenerPorId: (id: number) => `http://localhost:5000/productos/${id}`,
  descagarPlantillaProducto: "http://localhost:5000/productos/plantilla",
  guardarMasivoProductos: "http://localhost:5000/productos/masivo",

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

  // 🔽 Reporte específico: Insumos con equivalencias (Excel o PDF)
  exportarReporteInsumos: (desde?: string, hasta?: string) => {
    let url = "http://localhost:5000/productos/reporte-insumos";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  exportarReporteInsumosPDF: (desde?: string, hasta?: string) => {
    let url = "http://localhost:5000/productos/reporte-insumos/pdf";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  // 🔽 Reporte de Directos y Transformados (Excel o PDF)
  exportarReporteDirectosTransformados: (desde?: string, hasta?: string) => {
    let url = "http://localhost:5000/productos/reporte-directos-transformados";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  exportarReporteDirectosTransformadosPDF: (desde?: string, hasta?: string) => {
    let url =
      "http://localhost:5000/productos/reporte-directos-transformados/pdf";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },
  // 🔽 Verificación de nombre de producto
  verificarNombre: (nombre: string) =>
    `http://localhost:5000/productos/verificar?nombre=${encodeURIComponent(nombre)}`,

  productosPorCategoria: (id_cate: number) =>
    `http://localhost:5000/productos/categoria/${id_cate}`,
};
