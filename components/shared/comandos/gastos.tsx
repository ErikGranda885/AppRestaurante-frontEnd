import { SERVICIOS_GASTOS } from "@/services/gastos.service";
import React from "react"; // necesario para JSX en el mensaje visual

export const comandosDeGastos = [
  {
    nombre: "gastosHoy",
    patron:
      /\b(gastos( del)? d[ií]a|gastos de hoy|cu[aá]nt[oó] se gast[oó]|cu[aá]nt[oó] gast[ée] hoy)\b/i,

    handler: async (_m: RegExpMatchArray, ctx: any) => {
      ctx.agregarMensajeBot("⏳ Consultando gastos de hoy...");

      try {
        const hoy = new Date();
        const dia = hoy.getDate().toString().padStart(2, "0");
        const mes = (hoy.getMonth() + 1).toString().padStart(2, "0");
        const anio = hoy.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${anio}`;

        const resp = await fetch(SERVICIOS_GASTOS.listar);
        const datos = await resp.json();

        if (!Array.isArray(datos)) {
          ctx.agregarMensajeBot("❌ Respuesta inesperada del servidor.");
          return;
        }

        const gastosHoy = datos.filter((g: any) =>
          g.fech_gas?.startsWith(fechaFormateada),
        );

        if (gastosHoy.length === 0) {
          ctx.agregarMensajeBot("✅ No hay gastos registrados hoy.");
        } else {
          const total = gastosHoy.reduce(
            (sum: number, g: any) => sum + Number(g.mont_gas),
            0,
          );

          const detalleVisual = (
            <div className="space-y-2">
              <p>
                📅 <strong>Gastos de hoy ({fechaFormateada}):</strong>
              </p>
              <ul className="list-inside list-disc">
                {gastosHoy.map((g: any, i: number) => (
                  <li key={i}>
                    {g.desc_gas}: ${g.mont_gas}
                  </li>
                ))}
              </ul>
              <p>
                💰 <strong>Total: ${total.toFixed(2)}</strong>
              </p>
            </div>
          );

          ctx.agregarMensajeBot(detalleVisual);

          // Leer solo el total
          const u = new SpeechSynthesisUtterance(
            `Total: ${total.toFixed(2)} dólares`,
          );
          u.lang = "es-ES";
          window.speechSynthesis.speak(u);
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al consultar gastos: ${e.message}`);
      }
    },
  },
  {
    nombre: "registrarGasto",
    patron: /^registrar gasto[,:]?\s*(\d+(?:\.\d+)?)(?:\s+por\s+(.+))?$/i,
    handler: async (m: RegExpMatchArray, ctx: any) => {
      const monto = parseFloat(m[1]);
      const descripcion = m[2] || "Gasto sin descripción";

      ctx.agregarMensajeBot(
        `⏳ Registrando gasto de $${monto} por "${descripcion}"...`,
      );

      try {
        const now = new Date();
        const fechaFormateada = `${now.getFullYear()}-${String(
          now.getMonth() + 1,
        ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(
          now.getHours(),
        ).padStart(
          2,
          "0",
        )}:${String(now.getMinutes()).padStart(2, "0")}:${String(
          now.getSeconds(),
        ).padStart(2, "0")}`;

        const resp = await fetch(SERVICIOS_GASTOS.crear, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mont_gas: monto,
            desc_gas: descripcion,
            fech_gas: fechaFormateada,
          }),
        });

        const data = await resp.json();

        if (resp.ok) {
          ctx.agregarMensajeBot(
            `✅ Gasto registrado correctamente con ID ${data.id_gas}.`,
          );
        } else {
          ctx.agregarMensajeBot(`❌ Error: ${data.message || resp.statusText}`);
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al registrar gasto: ${e.message}`);
      }
    },
  },
];
