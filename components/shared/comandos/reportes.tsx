import React from "react";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";

export type FlowReporte = {
  step: "modulo" | "subreporte" | "formato" | "confirmacion";
  data: {
    modulo?: "productos" | "produccion" | "compras" | "ventas" | "gastos";
    subreporte?: string;
    formato?: "excel" | "pdf";
    inicioFlujo?: number;
  };
};

const subreportesPorModulo: Record<string, string[]> = {
  productos: ["inventario de insumos", "productos transformados"],
  produccion: ["equivalencias registradas", "transformaciones realizadas"],
  compras: ["historial de compras", "proveedores registrados"],
  ventas: ["ventas por fecha", "cierres diarios"],
  gastos: ["gastos por fecha"],
};

export async function handleFlowReporte(
  texto: string,
  flow: FlowReporte,
  ctx: any,
) {
  const t = texto.toLowerCase();

  if (flow.step === "modulo") {
    const mod = ["productos", "produccion", "compras", "ventas", "gastos"].find(
      (m) => t.includes(m),
    );
    if (!mod) {
      ctx.agregarMensajeBot(
        "❌ Módulo no reconocido. Puedes decir: productos, producción, compras, ventas o gastos.",
      );
      return;
    }

    flow.data.modulo = mod as FlowReporte["data"]["modulo"];
    flow.data.inicioFlujo = Date.now();

    const opciones = subreportesPorModulo[mod];
    ctx.setFlow({ ...flow, step: "subreporte" });
    ctx.agregarMensajeBot(
      <div>
        <p>
          📂 ¿Qué tipo de reporte de <strong>{mod}</strong> deseas?
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {opciones.map((s, i) => (
            <li key={i}>{s.charAt(0).toUpperCase() + s.slice(1)}</li>
          ))}
        </ul>
      </div>,
    );
    return;
  }

  if (flow.step === "subreporte") {
    const posibles = subreportesPorModulo[flow.data.modulo!];
    const match = posibles.find((s) => t.includes(s.split(" ")[0]));
    if (!match) {
      ctx.agregarMensajeBot(
        "❌ Subreporte no reconocido. Intenta con una opción listada.",
      );
      return;
    }
    flow.data.subreporte = match;
    ctx.setFlow({ ...flow, step: "formato" });
    ctx.agregarMensajeBot(
      <div>
        <p>📄 ¿En qué formato deseas el reporte?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Excel</li>
          <li>PDF</li>
        </ul>
      </div>,
    );
    return;
  }

  if (flow.step === "formato") {
    if (t.includes("excel")) flow.data.formato = "excel";
    else if (t.includes("pdf")) flow.data.formato = "pdf";
    else {
      ctx.agregarMensajeBot("❌ Formato no reconocido. ¿Excel o PDF?");
      return;
    }
    ctx.setFlow({ ...flow, step: "confirmacion" });
    ctx.agregarMensajeBot("✅ Generando reporte...");
    return await generarReporte(flow.data, ctx);
  }
}

async function generarReporte(
  data: {
    modulo?: string;
    subreporte?: string;
    formato?: "excel" | "pdf";
    inicioFlujo?: number;
  },
  ctx: any,
) {
  try {
    const { modulo, subreporte, formato, inicioFlujo } = data;
    const desde = new Date().toISOString().split("T")[0];
    const hasta = desde;
    let url = "";

    if (modulo === "productos") {
      if (subreporte === "inventario de insumos") {
        url =
          formato === "excel"
            ? SERVICIOS_PRODUCTOS.exportarReporteInsumos(desde, hasta)
            : SERVICIOS_PRODUCTOS.exportarReporteInsumosPDF(desde, hasta);
      } else if (subreporte === "productos transformados") {
        url =
          formato === "excel"
            ? SERVICIOS_PRODUCTOS.exportarReporteDirectosTransformados(
                desde,
                hasta,
              )
            : SERVICIOS_PRODUCTOS.exportarReporteDirectosTransformadosPDF(
                desde,
                hasta,
              );
      }
    } else {
      ctx.agregarMensajeBot(
        "🔧 Este tipo de reporte aún no está implementado.",
      );
      ctx.setFlow(null);
      return;
    }

    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json();
      const mensaje = errorData?.message || "Error al generar el archivo.";
      ctx.agregarMensajeBot(`❌ ${mensaje}`);
      ctx.setFlow(null);
      return;
    }

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${modulo}_${desde}.${formato === "excel" ? "xlsx" : "pdf"}`;
    link.click();

    const duracion = inicioFlujo
      ? Math.floor((Date.now() - inicioFlujo) / 1000)
      : null;

    ctx.agregarMensajeBot(
      <div>
        <p>
          📥 Reporte de <strong>{subreporte}</strong> generado correctamente.
        </p>
        {duracion !== null && (
          <p className="text-xs text-muted-foreground">
            ⏱️ Tiempo total: {duracion} segundos
          </p>
        )}
      </div>,
    );
    ctx.setFlow(null);
  } catch (e: any) {
    ctx.agregarMensajeBot(`❌ Error al generar el reporte: ${e.message}`);
    ctx.setFlow(null);
  }
}

export const comandoGenerarReporte = {
  nombre: "generarReporte",
  patron: /\b(generar|exportar)\s+(reporte|informe)\b/i,
  handler: async (_m: RegExpMatchArray, ctx: any) => {
    ctx.setFlow({ step: "modulo", data: {} } satisfies FlowReporte);
    ctx.agregarMensajeBot(
      <div>
        <p>🧾 ¿De qué módulo deseas el reporte?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Productos</li>
          <li>Producción</li>
          <li>Compras</li>
          <li>Ventas</li>
          <li>Gastos</li>
        </ul>
      </div>,
    );
  },
};
