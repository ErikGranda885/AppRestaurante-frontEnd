export const SERVICIOS_INVENTARIO = {
  // Lista de todos los productos con stock actualizado
  productosConStock:
    "https://apprestaurante-backend-production.up.railway.app/inventario/productos",

  // Consulta un producto por su ID con stock actualizado
  productoConStock: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/inventario/producto/${id}`,

  // Sincroniza manualmente el stock de un producto específico (misma ruta que productoConStock)
  sincronizarStockProducto: (id: number) =>
    `https://apprestaurante-backend-production.up.railway.app/inventario/producto/${id}`,

  // Sincroniza todos los productos (si necesitas un botón de mantenimiento)
  sincronizarTodos:
    "https://apprestaurante-backend-production.up.railway.app/inventario/productos",

  // Lista de productos próximos a caducar
  productosVencidos:
    "https://apprestaurante-backend-production.up.railway.app/inventario/caducar",

  // Realiza consumo por lote (disminuye stock en orden de vencimiento)
  consumirPorLote:
    "https://apprestaurante-backend-production.up.railway.app/inventario/consumir",

  // Consulta el stock por nombre de producto
  stockPorNombre: (nombre: string) =>
    `https://apprestaurante-backend-production.up.railway.app/inventario/stock?nombre=${encodeURIComponent(
      nombre,
    )}`,
};
