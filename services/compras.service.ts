export const SERVICIOS_COMPRAS = {
  compras: "https://apprestaurante-backend-production.up.railway.app/compras",
  obtenerDetalles:
    "https://apprestaurante-backend-production.up.railway.app/dets-compras",

  // Obtener una compra por su ID
  obtenerCompra: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/compras/${id}`,

  // Detalles de una compra
  obtenerDetalleCompra: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/dets-compras/${id}`,

  // Descargar PDF de la compra
  descargarFactura: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/pdf/factura/${id}`,

  // Registrar el pago de una compra
  registrarPago: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/compras/registrar-pago/${id}`,

  // Exportar reporte de compras en Excel
  exportarComprasExcel:
    "https://apprestaurante-backend-production.up.railway.app/compras/reporte/excel",

  // Exportar reporte de compras en PDF
  exportarComprasPDF:
    "https://apprestaurante-backend-production.up.railway.app/compras/reporte/pdf",
};
