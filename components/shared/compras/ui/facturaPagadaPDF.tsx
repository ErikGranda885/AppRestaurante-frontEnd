"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ICompra, IDetCompra } from "@/lib/types";
import { SERVICIOS_CONFIGURACIONES } from "@/services/configuraciones.service";

interface FacturaPagadaPDFProps {
  compra: ICompra;
  detalle: IDetCompra[];
  printRef: React.RefObject<HTMLDivElement | null>;
}

const FacturaPagadaPDF: React.FC<FacturaPagadaPDFProps> = ({
  compra,
  detalle,
  printRef,
}) => {
  const total = detalle.reduce((acc, p) => acc + Number(p.sub_tot_dcom), 0);

  const [logo, setLogo] = useState("/imagenes/logo.png");
  const [mostrarLogo, setMostrarLogo] = useState(false);

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

    // ✅ consultar si se debe mostrar el logo en facturas
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : "";

    if (token) {
      fetch(
        SERVICIOS_CONFIGURACIONES.obtenerPorClave("incluir_logo_facturas"),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.configuracion?.valor_conf === "true") {
            setMostrarLogo(true);
          }
        })
        .catch((err) => {
          console.error(
            "Error al obtener configuración incluir_logo_facturas",
            err,
          );
        });
    }
  }, []);

  return (
    <div
      ref={printRef}
      className="relative w-full bg-white px-10 pb-12 pt-8 text-sm text-black"
    >
      {/* Encabezado */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {compra.tipo_doc_comp} #{compra.id_comp}
          </h2>
          <p className="text-sm text-gray-600">
            Fecha: {new Date(compra.fech_comp).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Pagado el:{" "}
            {compra.fech_pag_comp
              ? new Date(compra.fech_pag_comp).toLocaleDateString()
              : "No disponible"}
          </p>
        </div>
        {mostrarLogo && (
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

      {/* Información de Emisor y Proveedor */}
      <div className="mb-6 grid grid-cols-2 gap-6 rounded border p-4 text-sm">
        <div>
          <h3 className="mb-1 font-bold uppercase text-gray-700">
            Emitido por:
          </h3>
          <p>{compra.usu_comp.nom_usu}</p>
          <p>{compra.usu_comp.email_usu}</p>
        </div>
        <div>
          <h3 className="mb-1 font-bold uppercase text-gray-700">Proveedor:</h3>
          <p>{compra.prov_comp.nom_prov}</p>
          <p>{compra.prov_comp.email_prov}</p>
          <p>{compra.prov_comp.tel_prov}</p>
          <p>{compra.prov_comp.direc_prov}</p>
        </div>
      </div>

      {/* Tabla de Detalles */}
      <table className="mb-4 w-full table-auto border text-sm">
        <thead className="bg-gray-100">
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
                ${Number(item.prec_uni_dcom).toFixed(2)}
              </td>
              <td className="border p-2 text-center">
                ${(item.cant_dcom * Number(item.prec_uni_dcom)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="ml-auto w-full max-w-sm rounded-md border p-4 text-sm">
        <div className="flex justify-between">
          <span>Total:</span>
          <span className="font-semibold">${total.toFixed(2)}</span>
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
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Comprobante de Transferencia */}
      {compra.form_pag_comp === "transferencia" && (
        <div className="mt-6 rounded border p-4 text-sm">
          <h3 className="mb-2 font-semibold text-gray-800">
            Detalles del Comprobante
          </h3>
          <p>
            <span className="font-medium">N° de Comprobante:</span>{" "}
            {compra.num_tra_comprob_comp || "No disponible"}
          </p>
          {compra.comprob_tran_comp && (
            <p className="mt-1">
              <a
                href={compra.comprob_tran_comp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Descargar Comprobante
              </a>
            </p>
          )}
        </div>
      )}

      {/* Firmas */}
      <div className="mt-10 grid grid-cols-3 text-center text-xs text-gray-600">
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
  );
};

export default FacturaPagadaPDF;
