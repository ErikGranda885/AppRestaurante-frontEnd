const ejemplos: Record<string, string> = {
  inventario: "Inventario de Coca Cola",
  agregarProducto: "Agregar producto Dorito azul",
  ventasHoy: "¿Cuánto se vendió hoy?",
  iniciarVenta: "Registrar venta",
  registrarGasto: "Registrar gasto 5.75 por pan",
  gastosHoy: "¿Cuánto gasté hoy?",
  realizarTransformacion: "Transformar 4 de shawarma",
  transformacionesHoy: "¿Qué transformaciones se hicieron hoy?",
  generarReporte: "Generar reporte",
  verComandos: "Ver comandos",
};

export function generarEjemplosDeComandos(): string[] {
  return Object.values(ejemplos);
}

export default ejemplos;
