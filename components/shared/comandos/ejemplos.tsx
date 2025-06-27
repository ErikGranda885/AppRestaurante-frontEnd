const ejemplos: Record<string, { texto: string; roles?: string[] }> = {
  inventario: {
    texto: "Inventario de Coca Cola",
    roles: ["administrador", "empleado", "sistema"],
  },
  agregarProducto: {
    texto: "Agregar producto Dorito azul",
    roles: ["administrador", "sistema"],
  },
  ventasHoy: {
    texto: "¿Cuánto se vendió hoy?",
    roles: ["administrador", "empleado", "sistema"],
  },
  iniciarVenta: {
    texto: "Registrar venta",
    roles: ["administrador", "empleado", "sistema"],
  },
  registrarGasto: {
    texto: "Registrar gasto 5.75 por pan",
    roles: ["administrador", "empleado", "sistema"],
  },
  gastosHoy: {
    texto: "¿Cuánto gasté hoy?",
    roles: ["administrador", "empleado", "sistema"],
  },
  realizarTransformacion: {
    texto: "Transformar 4 de shawarma",
    roles: ["administrador","empleado", "sistema"],
  },
  transformacionesHoy: {
    texto: "¿Qué transformaciones se hicieron hoy?",
    roles: ["administrador", "sistema"],
  },
  generarReporte: {
    texto: "Generar reporte",
    roles: ["administrador", "sistema"],
  },
  verComandos: { texto: "Ver comandos" }, // visible a todos
};

export function generarEjemplosDeComandos(rol: string): string[] {
  const rolNormalizado = rol.trim().toLowerCase();

  console.log("🧪 Rol normalizado:", rolNormalizado);

  const resultados = Object.values(ejemplos)
    .filter((ej) => {
      const rolesPermitidos =
        ej.roles?.map((r) => r.trim().toLowerCase()) ?? [];

      const permitido =
        rolesPermitidos.length === 0 ||
        rolesPermitidos.some(
          (r) =>
            r.localeCompare(rolNormalizado, undefined, {
              sensitivity: "base",
            }) === 0,
        );

      console.log("📌 Evaluando comando:", ej.texto);
      console.log(
        "🔍 RolesPermitidos (normalizados):",
        JSON.stringify(rolesPermitidos),
      );
      console.log("🎯 Rol actual (normalizado):", rolNormalizado);
      console.log("✅ ¿Incluye?:", permitido);

      return permitido;
    })
    .map((ej) => ej.texto);

  console.log("✅ Ejemplos generados:", resultados);
  return resultados;
}

export default ejemplos;
