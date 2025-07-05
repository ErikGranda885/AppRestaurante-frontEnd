export const SERVICIOS = {
  // Endpoint para obtener la lista de categorías
  categorias:
    "https://apprestaurante-backend-production.up.railway.app/categorias",
  obtenerCategoria: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/categorias/${id}`,
  cargarMasivo:
    "https://apprestaurante-backend-production.up.railway.app/categorias/masivo",
  generarPlantillaCategoria:
    "https://apprestaurante-backend-production.up.railway.app/categorias/plantilla",
  // Endpoint para activar una categoría; se requiere el ID de la categoría
  activarCategoria: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/categorias/activar/${id}`,

  // Endpoint para inactivar una categoría; se requiere el ID de la categoría
  inactivarCategoria: (id: number | string) =>
    `https://apprestaurante-backend-production.up.railway.app/categorias/inactivar/${id}`,
  verificarNombreCategoria: (nombre: string) =>
    `https://apprestaurante-backend-production.up.railway.app/categorias/verificar?nombre=${encodeURIComponent(nombre)}`,

  exportarCategoriasExcel:
    "https://apprestaurante-backend-production.up.railway.app/categorias/exportar-excel",
  exportarCategoriasPDF:
    "https://apprestaurante-backend-production.up.railway.app/categorias/exportar-pdf",
};
