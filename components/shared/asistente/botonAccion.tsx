import React, { useState } from "react";

export function BotonAccion({ paso, pasoActual, onClick, children, ...rest }:any) {
  const [clicked, setClicked] = useState(false);

  // El botón está activo SOLO si es el paso actual y no se ha hecho click antes
  const isActivo = paso === pasoActual && !clicked;

  return (
    <button
      className="btn-opciones"
      disabled={!isActivo}
      style={!isActivo ? { opacity: 0.5, pointerEvents: "none" } : {}}
      onClick={(e) => {
        // Solo ejecuta si sigue siendo el paso y no se ha hecho click antes
        if (!isActivo) return;
        setClicked(true); // deshabilita tras primer click
        onClick(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
