"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ICompra, IDetCompra } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { safePrice } from "@/utils/format";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";

interface FacturaModalProps {
  open: boolean;
  onClose: () => void;
  compra: ICompra;
  detalle: IDetCompra[];
  onConfirm: () => void;
  printRef?: React.RefObject<HTMLDivElement | null>;
}

const FacturaModal: React.FC<FacturaModalProps> = ({
  open,
  onClose,
  compra,
  detalle,
  onConfirm,
  printRef,
}) => {
  const { ventasConfig } = useConfiguracionesVentas();
  const [logo, setLogo] = useState("/imagenes/logo.png");

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-md bg-white p-8 text-black shadow-xl print:max-w-[100%] print:overflow-visible print:rounded-none print:p-0 print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle className="mb-4 text-start text-2xl font-bold tracking-wide text-black">
            Previsualización del documento
          </DialogTitle>
        </DialogHeader>

        <div
          id="factura-preview"
          ref={printRef ?? null}
          className="w-full text-black print:w-full print:max-w-[100%] print:px-10 print:pb-12 print:pt-8 print:text-[13px]"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {compra.tipo_doc_comp} #{compra.id_comp}
              </h2>
              <p className="text-sm">
                Fecha: {new Date(compra.fech_comp).toLocaleDateString()}
              </p>
            </div>
            <div className="relative h-10 w-20">
              <Image
                src={logo}
                alt="Logo Empresa"
                fill
                className="object-contain"
                onError={() => setLogo("/imagenes/logo.png")}
              />
            </div>
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

          <div className="overflow-x-auto">
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
                      {safePrice(item.prec_uni_dcom, ventasConfig.moneda)}
                    </td>
                    <td className="border p-2 text-center">
                      {safePrice(
                        item.cant_dcom * item.prec_uni_dcom,
                        ventasConfig.moneda,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto w-full max-w-sm rounded-md border p-4 text-sm print:ml-0 print:mt-4 print:max-w-full">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">
                {safePrice(
                  detalle.reduce((acc, p) => acc + p.sub_tot_dcom, 0),
                  ventasConfig.moneda,
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Descuento:</span>
              {safePrice(0, ventasConfig.moneda)}
            </div>
            <div className="flex justify-between">
              <span>Impuesto:</span>
              <span>{safePrice(0, ventasConfig.moneda)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Final:</span>
              <span>
                {safePrice(
                  detalle.reduce((acc, p) => acc + p.sub_tot_dcom, 0),
                  ventasConfig.moneda,
                )}
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

        <DialogFooter className="mt-8 flex justify-end gap-2 print:hidden">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirmar y Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FacturaModal;
