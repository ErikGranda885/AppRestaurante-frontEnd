"use client";

import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { safePrice } from "@/utils/format";
import { useEffect, useState } from "react";

interface TicketPreviewProps {
  venta: any;
}

interface EmpresaLocal {
  nom_emp: string;
  dir_emp: string;
  tel_emp: string;
  ruc_emp: string;
  auth_num?: string; // Número de autorización SRI
  serie?: string; // Ej.: "001-002"
  caducidad?: string; // Fecha de caducidad en formato mm/aaaa
}

export function TicketPreview({ venta }: TicketPreviewProps) {
  const { ventasConfig } = useConfiguracionesVentas();

  const [empresa, setEmpresa] = useState<EmpresaLocal>({
    nom_emp: "Mi Restaurante",
    dir_emp: "Dirección no configurada",
    tel_emp: "---",
    ruc_emp: "---",
    auth_num: "0000000000", // Valor predeterminado
    serie: "001-001",
    caducidad: "12/2025",
  });

  useEffect(() => {
    const empresaLS = localStorage.getItem("empresa_actual");
    if (empresaLS && empresaLS !== "null") {
      try {
        const e = JSON.parse(empresaLS);
        setEmpresa({
          nom_emp: e.nom_emp ?? empresa.nom_emp,
          dir_emp: e.dir_emp ?? empresa.dir_emp,
          tel_emp: e.tel_emp ?? empresa.tel_emp,
          ruc_emp: e.ruc_emp ?? empresa.ruc_emp,
          auth_num: e.auth_num ?? empresa.auth_num,
          serie: e.serie ?? empresa.serie,
          caducidad: e.caducidad ?? empresa.caducidad,
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
        <p className="text-[10px]">
          AUT. SRI: {empresa.auth_num} &nbsp; Caduca: {empresa.caducidad}
        </p>
      </div>

      {/* Serie y Numeración */}
      <div className="my-2 border-t border-dashed border-black pt-2 leading-4">
        <div>NOTA DE VENTA</div>
        <div>Serie/Punto: {empresa.serie}</div>
        <div>Recibo: #{venta.id_venta}</div>
        <div>Fecha: {new Date(venta.fecha).toLocaleDateString()}</div>
        <div>Hora: {new Date(venta.fecha).toLocaleTimeString()}</div>
        <div>Tipo de pago: {venta.tipoPago}</div>
        <div>Empleado: {venta.cliente.nom_usu}</div>
      </div>

      {/* Tabla de productos */}
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
              {safePrice(prod.subtotal / prod.cantidad, ventasConfig.moneda)}
            </span>
            <span className="w-12 text-right">
              {safePrice(Number(prod.subtotal ?? 0), ventasConfig.moneda)}
            </span>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="mt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            {safePrice(
              venta.productos.reduce(
                (acc: number, p: any) => acc + Number(p.subtotal ?? 0),
                0,
              ),
              ventasConfig.moneda,
            )}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>
            {safePrice(Number(venta.total ?? 0), ventasConfig.moneda)}
          </span>
        </div>

        {venta.tipoPago === "efectivo" && (
          <>
            <div className="flex justify-between">
              <span>Pago</span>
              <span>
                {safePrice(
                  Number(venta.efectivoRecibido ?? 0),
                  ventasConfig.moneda,
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cambio</span>
              <span>
                {safePrice(
                  Number(venta.efectivoCambio ?? 0),
                  ventasConfig.moneda,
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Footer con leyendas */}
      <div className="mt-4 border-t border-dashed border-black pt-2 text-center text-[10px]">
        Original – Adquirente / Copia – Emisor
      </div>
      <div className="mt-1 text-center text-[8px] leading-[10px]">
        Este documento es únicamente una nota de venta autorizada por el SRI,
        válida como comprobante a consumidores finales. No sustituye una
        factura.
      </div>
      <div className="mt-1 text-center text-[10px]">
        ¡Gracias por tu consumo!
      </div>
    </div>
  );
}
