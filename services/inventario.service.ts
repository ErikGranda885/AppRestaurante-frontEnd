export const SERVICIOS_INVENTARIO = {
  // Lista de todos los productos con stock actualizado
  productosConStock: "http://localhost:5000/inventario/productos",

  // Consulta un producto por su ID con stock actualizado
  productoConStock: (id: number) =>
    `http://localhost:5000/inventario/producto/${id}`,

  // Sincroniza manualmente el stock de un producto específico
  sincronizarStockProducto: (id: number) =>
    `http://localhost:5000/inventario/sincronizar-stock/${id}`,

  // Sincroniza todos los productos (si necesitas un botón de mantenimiento)
  sincronizarTodos: "http://localhost:5000/inventario/sincronizar-stock",

  // Lista de productos con lotes vencidos (puedes agregar este endpoint si deseas)
  productosVencidos: "http://localhost:5000/inventario/vencidos",
  // Realiza consumo por lote (disminuye stock en orden de vencimiento)
  consumirPorLote: "http://localhost:5000/inventario/consumir",
};
