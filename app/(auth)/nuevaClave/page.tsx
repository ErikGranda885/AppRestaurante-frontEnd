import { Suspense } from "react";
import RestablecerPasswordComponent from "./restablecerPasswordComponent";

export default function NuevaClavePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando formulario...</div>}>
      <RestablecerPasswordComponent />
    </Suspense>
  );
}
