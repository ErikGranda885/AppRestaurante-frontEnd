export function useChatContext({
  setFlowProducto,
  setFlowVenta,
  setFlowGasto,
  setFlowReporte,
  setInicioFlujo,
  setPendingSuggestions,
}: {
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
    crearContexto: (agregarMensajeBot: any, inicioFlujo: number | null) => ({
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
    }),
  };
}
