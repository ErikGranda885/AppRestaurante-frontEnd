"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ICompra, IDetCompra } from "@/lib/types";
import { useConfiguracionesBranding } from "@/hooks/configuraciones/generales/useConfiguracionesBranding";

interface FacturaPendientePDFProps {
  compra: ICompra;
  detalle: IDetCompra[];
  printRef: React.RefObject<HTMLDivElement | null>;
}

const FacturaPendientePDF: React.FC<FacturaPendientePDFProps> = ({
  compra,
  detalle,
  printRef,
}) => {
  const [logo, setLogo] = useState("/imagenes/logo.png");
  const { logoFacturas } = useConfiguracionesBranding(); // ✅ INTEGRADO

  useEffect(() => {
    const empresaLS = localStorage.getItem("empresa_actual");
    if (empresaLS && empresaLS !== "null") {
      try {
        const empresa = JSON.parse(empresaLS);
        if (empresa.logo_emp) {
          setLogo(
            empresa.logo_emp.startsWith("http")
              ? empresa.logo_emp
              : "/imagenes/logo.png",
          );
        }
      } catch (error) {
        console.error("Error al obtener empresa_actual:", error);
      }
    }
  }, []);

  return (
    <div
      ref={printRef}
      className="relative w-full bg-white px-10 pb-12 pt-8 text-sm text-black"
    >
      {/* Marca de agua */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-10 print:opacity-20">
        <h1 className="rotate-[-30deg] text-5xl font-bold text-red-600">
          ❌ Copia no válida sin pago
        </h1>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {compra.tipo_doc_comp} #{compra.id_comp}
            </h2>
            <p className="text-sm">
              Fecha: {new Date(compra.fech_comp).toLocaleDateString()}
            </p>
          </div>

          {/* ✅ Solo mostrar logo si está activado en configuraciones */}
          {logoFacturas && (
            <div className="relative h-10 w-20">
              <Image
                src={logo}
                alt="Logo Empresa"
                fill
                className="object-contain"
                onError={() => setLogo("/imagenes/logo.png")}
              />
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6 border p-4 text-sm">
          <div>
            <h3 className="mb-1 text-sm font-bold uppercase">Emitido por:</h3>
            <p>{compra.usu_comp.nom_usu}</p>
            <p>{compra.usu_comp.email_usu}</p>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-bold uppercase">De:</h3>
            <p>{compra.prov_comp.nom_prov}</p>
            <p>{compra.prov_comp.email_prov}</p>
            <p>{compra.prov_comp.tel_prov}</p>
            <p>{compra.prov_comp.direc_prov}</p>
          </div>
        </div>

        <table className="mb-4 w-full table-auto border text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Producto</th>
              <th className="border p-2 text-center">Cantidad</th>
              <th className="border p-2 text-center">Precio Unitario</th>
              <th className="border p-2 text-center">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((item, index) => (
              <tr key={item.id_dcom}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{item.prod_dcom.nom_prod}</td>
                <td className="border p-2 text-center">{item.cant_dcom}</td>
                <td className="border p-2 text-center">
                  ${item.prec_uni_dcom.toFixed(2)}
                </td>
                <td className="border p-2 text-center">
                  ${(item.cant_dcom * item.prec_uni_dcom).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-full max-w-sm rounded-md border p-4 text-sm">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-semibold">
              ${detalle.reduce((acc, p) => acc + p.sub_tot_dcom, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Descuento:</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Impuesto:</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total Final:</span>
            <span>
              ${detalle.reduce((acc, p) => acc + p.sub_tot_dcom, 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 text-center text-xs text-muted-foreground">
          <div>
            ________________________
            <p>Encargado de cuenta</p>
          </div>
          <div>
            ________________________
            <p>Administrador</p>
          </div>
          <div>
            ________________________
            <p>Gerente general</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacturaPendientePDF;
