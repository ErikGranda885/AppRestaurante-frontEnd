export const SERVICIOS_COMPRAS = {
  compras:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/compras",
  obtenerDetalles:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/dets-compras",

  // Obtener una compra por su ID
  obtenerCompra: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/compras/${id}`,

  // Detalles de una compra
  obtenerDetalleCompra: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/dets-compras/${id}`,

  // Descargar PDF de la compra
  descargarFactura: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/pdf/factura/${id}`,

  // Registrar el pago de una compra
  registrarPago: (id: number) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/compras/registrar-pago/${id}`,

  // Exportar reporte de compras en Excel
  exportarComprasExcel:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/compras/reporte/excel",

  // Exportar reporte de compras en PDF
  exportarComprasPDF:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/compras/reporte/pdf",
};
