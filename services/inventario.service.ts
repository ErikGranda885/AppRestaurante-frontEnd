export const SERVICIOS_INVENTARIO = {
  // Lista de todos los productos con stock actualizado
  productosConStock: "http://localhost:5000/inventario/productos",

  // Consulta un producto por su ID con stock actualizado
  productoConStock: (id: number) =>
    `http://localhost:5000/inventario/producto/${id}`,

  // Sincroniza manualmente el stock de un producto específico (misma ruta que productoConStock)
  sincronizarStockProducto: (id: number) =>
    `http://localhost:5000/inventario/producto/${id}`,

  // Sincroniza todos los productos (si necesitas un botón de mantenimiento)
  sincronizarTodos: "http://localhost:5000/inventario/productos",

  // Lista de productos próximos a caducar
  productosVencidos: "http://localhost:5000/inventario/caducar",

  // Realiza consumo por lote (disminuye stock en orden de vencimiento)
  consumirPorLote: "http://localhost:5000/inventario/consumir",

  // Consulta el stock por nombre de producto
  stockPorNombre: (nombre: string) =>
    `http://localhost:5000/inventario/stock?nombre=${encodeURIComponent(
      nombre,
    )}`,
};
