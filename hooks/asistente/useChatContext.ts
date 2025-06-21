export function useChatContext({
  flowProducto,
  flowVenta,
  flowGasto,
  flowReporte,
  setFlowProducto,
  setFlowVenta,
  setFlowGasto,
  setFlowReporte,
  setInicioFlujo,
  setPendingSuggestions,
}: {
  flowProducto: any;
  flowVenta: any;
  flowGasto: any;
  flowReporte: any;
  setFlowProducto: any;
  setFlowVenta: any;
  setFlowGasto: any;
  setFlowReporte: any;
  setInicioFlujo: any;
  setPendingSuggestions: any;
}) {
  const pasosDeProducto = [
    "confirmacion",
    "tipo",
    "categoria",
    "unidad",
    "sugerenciaInventario",
  ];
  const pasosDeVenta = ["categoria", "producto", "cantidad", "pago"];
  const pasosDeReporte = ["modulo", "subreporte", "formato", "confirmacion"];

  return {
    crearContexto: (agregarMensajeBot: any, inicioFlujo: number | null) => {
      return {
        agregarMensajeBot,
        establecerSugerenciasPendientes: setPendingSuggestions,
        obtenerInicioFlujo: () => inicioFlujo,
        setFlow: (flow: any | null) => {
          if (!flow) {
            setFlowProducto(null);
            setFlowVenta(null);
            setFlowGasto(null);
            setFlowReporte(null);
            setInicioFlujo(null);
            return;
          }

          if (pasosDeProducto.includes(flow.step)) {
            setFlowProducto(flow);
            setFlowVenta(null);
            setFlowGasto(null);
            setFlowReporte(null);
          } else if (pasosDeVenta.includes(flow.step)) {
            setFlowVenta(flow);
            setFlowProducto(null);
            setFlowGasto(null);
            setFlowReporte(null);
          } else if (pasosDeReporte.includes(flow.step)) {
            setFlowReporte(flow);
            setFlowProducto(null);
            setFlowVenta(null);
            setFlowGasto(null);
          }
        },
        // ✅ Agrega esto:
        flow: () => {
          if (flowProducto) return flowProducto;
          if (flowVenta) return flowVenta;
          if (flowGasto) return flowGasto;
          if (flowReporte) return flowReporte;
          return null;
        },
      };
    },
  };
}
