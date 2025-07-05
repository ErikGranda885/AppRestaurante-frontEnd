export const SERVICIOS_PRODUCTOS = {
  categorias:
    "https://apprestaurante-backend-production.up.railway.app/categorias",
  productos:
    "https://apprestaurante-backend-production.up.railway.app/productos",
  obtenerPorId: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/${id}`,
  descagarPlantillaProducto:
    "https://apprestaurante-backend-production.up.railway.app/productos/plantilla",
  guardarMasivoProductos:
    "https://apprestaurante-backend-production.up.railway.app/productos/masivo",

  inactivarProducto: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/inactivar/${id}`,

  activarProducto: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/activar/${id}`,

  actualizarProducto: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/${id}`,

  // 🔽 Rutas para exportación general
  exportarProductosJson: (tipo: string) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/reportes/json?tipo=${tipo}`,

  exportarProductosExcel: (tipo: string) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/reportes/excel?tipo=${tipo}`,

  exportarProductosPDF: (tipo: string) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/reportes/pdf?tipo=${tipo}`,

  // 🔽 Reporte específico: Insumos con equivalencias (Excel o PDF)
  exportarReporteInsumos: (desde?: string, hasta?: string) => {
    let url =
      "https://apprestaurante-backend-production.up.railway.app/productos/reporte-insumos";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  exportarReporteInsumosPDF: (desde?: string, hasta?: string) => {
    let url =
      "https://apprestaurante-backend-production.up.railway.app/productos/reporte-insumos/pdf";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  // 🔽 Reporte de Directos y Transformados (Excel o PDF)
  exportarReporteDirectosTransformados: (desde?: string, hasta?: string) => {
    let url =
      "https://apprestaurante-backend-production.up.railway.app/productos/reporte-directos-transformados";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },

  exportarReporteDirectosTransformadosPDF: (desde?: string, hasta?: string) => {
    let url =
      "https://apprestaurante-backend-production.up.railway.app/productos/reporte-directos-transformados/pdf";
    const params = [];
    if (desde) params.push(`desde=${desde}`);
    if (hasta) params.push(`hasta=${hasta}`);
    return params.length ? `${url}?${params.join("&")}` : url;
  },
  // 🔽 Verificación de nombre de producto
  verificarNombre: (nombre: string) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/verificar?nombre=${encodeURIComponent(nombre)}`,

  productosPorCategoria: (id_cate: number) =>
    `https://apprestaurante-backend-production.up.railway.app/productos/categoria/${id_cate}`,
};
