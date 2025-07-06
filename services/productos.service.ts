export const SERVICIOS_PRODUCTOS = {
  categorias:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/categorias",
  productos:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/productos",
  obtenerPorId: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/${id}`,
  descagarPlantillaProducto:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/productos/plantilla",
  guardarMasivoProductos:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/productos/masivo",

  inactivarProducto: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/inactivar/${id}`,

  activarProducto: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/activar/${id}`,

  actualizarProducto: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/${id}`,

  // 🔽 Rutas para exportación general
  exportarProductosJson: (tipo: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/reportes/json?tipo=${tipo}`,

  exportarProductosExcel: (tipo: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/reportes/excel?tipo=${tipo}`,

  exportarProductosPDF: (tipo: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/reportes/pdf?tipo=${tipo}`,

  // 🔽 Reporte específico: Insumos con equivalencias (Excel o PDF)
  exportarReporteInsumos: (desde?: string, hasta?: string) => {
    let url =
      "https://app-restaurante-backend-933168389237.us-central1.run.app/productos/reporte-insumos";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  exportarReporteInsumosPDF: (desde?: string, hasta?: string) => {
    let url =
      "https://app-restaurante-backend-933168389237.us-central1.run.app/productos/reporte-insumos/pdf";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  // 🔽 Reporte de Directos y Transformados (Excel o PDF)
  exportarReporteDirectosTransformados: (desde?: string, hasta?: string) => {
    let url =
      "https://app-restaurante-backend-933168389237.us-central1.run.app/productos/reporte-directos-transformados";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  exportarReporteDirectosTransformadosPDF: (desde?: string, hasta?: string) => {
    let url =
      "https://app-restaurante-backend-933168389237.us-central1.run.app/productos/reporte-directos-transformados/pdf";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },
  // 🔽 Verificación de nombre de producto
  verificarNombre: (nombre: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/verificar?nombre=${encodeURIComponent(nombre)}`,

  productosPorCategoria: (id_cate: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/productos/categoria/${id_cate}`,
};
