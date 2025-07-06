export const SERVICIOS = {
  // Endpoint para obtener la lista de categorías
  categorias:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/categorias",
  obtenerCategoria: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/categorias/${id}`,
  cargarMasivo:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/categorias/masivo",
  generarPlantillaCategoria:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/categorias/plantilla",
  // Endpoint para activar una categoría; se requiere el ID de la categoría
  activarCategoria: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/categorias/activar/${id}`,

  // Endpoint para inactivar una categoría; se requiere el ID de la categoría
  inactivarCategoria: (id: number | string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/categorias/inactivar/${id}`,
  verificarNombreCategoria: (nombre: string) =>
    `https://app-restaurante-backend-933168389237.us-central1.run.app/categorias/verificar?nombre=${encodeURIComponent(nombre)}`,

  exportarCategoriasExcel:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/categorias/exportar-excel",
  exportarCategoriasPDF:
    "https://app-restaurante-backend-933168389237.us-central1.run.app/categorias/exportar-pdf",
};
