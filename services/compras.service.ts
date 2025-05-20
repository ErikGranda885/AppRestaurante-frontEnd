export const SERVICIOS_COMPRAS = {
  compras: "http://localhost:5000/compras",

  // Obtener una compra por su ID
  obtenerCompra: (id: number) => `http://localhost:5000/compras/${id}`,

  // Detalles de una compra
  obtenerDetalleCompra: (id: number) =>
    `http://localhost:5000/dets-compras/${id}`,

  // Descargar PDF de la compra
  descargarFactura: (id: number) => `http://localhost:5000/pdf/factura/${id}`,

  // Registrar el pago de una compra
  registrarPago: (id: number) =>
    `http://localhost:5000/compras/registrar-pago/${id}`,

  // Exportar reporte de compras en Excel
  exportarComprasExcel: "http://localhost:5000/compras/reporte/excel",

  // Exportar reporte de compras en PDF
  exportarComprasPDF: "http://localhost:5000/compras/reporte/pdf",
};
