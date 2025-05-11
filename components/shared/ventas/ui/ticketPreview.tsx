"use client";

import { useEffect, useState } from "react";

interface TicketPreviewProps {
  venta: any;
}

interface EmpresaLocal {
  nom_emp: string;
  dir_emp: string;
  tel_emp: string;
  ruc_emp: string;
}

export function TicketPreview({ venta }: TicketPreviewProps) {
  const [empresa, setEmpresa] = useState<EmpresaLocal>({
    nom_emp: "Mi Restaurante",
    dir_emp: "Dirección no configurada",
    tel_emp: "---",
    ruc_emp: "---",
  });

  useEffect(() => {
    const empresaLS = localStorage.getItem("empresa_actual");
    if (empresaLS && empresaLS !== "null") {
      try {
        const empresaData = JSON.parse(empresaLS);
        setEmpresa({
          nom_emp: empresaData.nom_emp ?? "Mi Restaurante",
          dir_emp: empresaData.dir_emp ?? "Dirección no configurada",
          tel_emp: empresaData.tel_emp ?? "---",
          ruc_emp: empresaData.ruc_emp ?? "---",
        });
      } catch (error) {
        console.error("Error al obtener empresa_actual:", error);
      }
    }
  }, []);

  return (
    <div className="ticket w-[300px] rounded-b-[20px] bg-white p-4 font-mono text-[10px] text-black shadow-md dark:bg-white">
      {/* Cabecera */}
      <div className="text-center text-[11px]">
        <h2 className="text-base font-bold uppercase">{empresa.nom_emp}</h2>
        <p className="leading-4">
          {empresa.dir_emp} <br />
          Tel: {empresa.tel_emp}
        </p>
        <p className="pt-1 text-[10px]">RUC: {empresa.ruc_emp}</p>
      </div>

      {/* Info */}
      <div className="my-2 border-t border-dashed border-black pt-2 leading-4">
        <div>Recibo: #{venta.id_venta}</div>
        <div>Fecha: {new Date(venta.fecha).toLocaleDateString()}</div>
        <div>Hora: {new Date(venta.fecha).toLocaleTimeString()}</div>
        <div>Tipo de pago: {venta.tipoPago}</div>
        <div>Empleado: {venta.cliente.nom_usu}</div>
      </div>

      {/* Tabla */}
      <div className="mt-2 border-y border-black py-2">
        <div className="mb-1 flex justify-between font-semibold">
          <span className="w-8">Cant</span>
          <span className="flex-1">Descripción</span>
          <span className="w-10 text-right">P.U.</span>
          <span className="w-12 text-right">Total</span>
        </div>
        {venta.productos.map((prod: any, i: number) => (
          <div key={i} className="mb-0.5 flex justify-between">
            <span className="w-8">{prod.cantidad}</span>
            <span className="flex-1 truncate">{prod.nombre}</span>
            <span className="w-10 text-right">
              ${(prod.subtotal / prod.cantidad).toFixed(2)}
            </span>
            <span className="w-12 text-right">
              ${Number(prod.subtotal ?? 0).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="mt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            $
            {venta.productos
              .reduce((acc: number, p: any) => acc + Number(p.subtotal ?? 0), 0)
              .toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>${Number(venta.total ?? 0).toFixed(2)}</span>
        </div>

        {venta.tipoPago === "efectivo" && (
          <>
            <div className="flex justify-between">
              <span>Pago</span>
              <span>${Number(venta.efectivoRecibido ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cambio</span>
              <span>${Number(venta.efectivoCambio ?? 0).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-dashed border-black pt-2 text-center text-[10px]">
        ¡Gracias por tu compra!
      </div>
      <div className="mt-1 text-center text-[8px] leading-[10px]">
        Este documento es únicamente un recibo de compra, no sustituye a una
        factura.
      </div>
    </div>
  );
}
