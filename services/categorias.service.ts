export const SERVICIOS = {
  // Endpoint para obtener la lista de categorías
  categorias: "http://localhost:5000/categorias",

  // Endpoint para activar una categoría; se requiere el ID de la categoría
  activarCategoria: (id: number | string) =>
    `http://localhost:5000/categorias/activar/${id}`,

  // Endpoint para inactivar una categoría; se requiere el ID de la categoría
  inactivarCategoria: (id: number | string) =>
    `http://localhost:5000/categorias/inactivar/${id}`,

  exportarCategoriasExcel: "http://localhost:5000/categorias/exportar-excel",
  exportarCategoriasPDF: "http://localhost:5000/categorias/exportar-pdf",
};
