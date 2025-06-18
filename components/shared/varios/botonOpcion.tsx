// components/BotonOpcion.tsx
"use client";

export function BotonOpcion({
  texto,
  onClick,
}: {
  texto: string;
  onClick: () => void;
}) {
  return (
    <button
      className="btn-opciones rounded-md bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
      onClick={onClick}
    >
      {texto}
    </button>
  );
}
