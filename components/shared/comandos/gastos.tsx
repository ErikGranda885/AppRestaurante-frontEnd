import { SERVICIOS_GASTOS } from "@/services/gastos.service";
import { convertirCantidad } from "@/utils/conversorCantidad";

export const comandosDeGastos = [
  {
    nombre: "gastosHoy",
    patron:
      /\b(gastos( del)? d[ií]a|gastos de hoy|cu[aá]nt[oó] se gast[oó]|cu[aá]nt[oó] gast[ée] hoy)\b/i,

    handler: async (_m: RegExpMatchArray, ctx: any) => {
      try {
        const hoy = new Date();
        const dia = hoy.getDate().toString().padStart(2, "0");
        const mes = (hoy.getMonth() + 1).toString().padStart(2, "0");
        const anio = hoy.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${anio}`;

        const resp = await fetch(SERVICIOS_GASTOS.listar);
        const datos = await resp.json();

        if (!Array.isArray(datos)) {
          ctx.agregarMensajeBot("❌ Respuesta inesperada del servidor.", true);
          return;
        }

        const gastosHoy = datos.filter((g: any) =>
          g.fech_gas?.startsWith(fechaFormateada),
        );

        if (gastosHoy.length === 0) {
          ctx.agregarMensajeBot("🤖 No se han registrado gastos el día de hoy", true);
        } else {
          const total = gastosHoy.reduce(
            (sum: number, g: any) => sum + Number(g.mont_gas),
            0,
          );

          // Dólares o centavos automático
          const unidad = total < 1 ? "centavos" : "dólares";
          const cantidadFormateada =
            total < 1
              ? `${(total * 100).toFixed(0)}` // Solo enteros para centavos
              : `${total.toFixed(2)}`; // 2 decimales para dólares

          // Luego el mensaje visual (NO se lee)
          ctx.agregarMensajeBot(
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
            </div>,
            false, // Visual, no lo lee
          );
          // Primero el mensaje leído
          ctx.agregarMensajeBot(
            `💰 El total de gastos hoy es ${cantidadFormateada} ${unidad}.`,
            true, // Solo lee el texto
          );
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(
          `❌ Error al consultar gastos: ${e.message}`,
          true,
        );
      }
    },
  },
  {
    nombre: "registrarGasto",
    patron: /^registrar gasto[,:]?\s*(.+?)(?:\s+por\s+(.+))?$/i,
    handler: async (m: RegExpMatchArray, ctx: any) => {
      const descripcion = m[2] || "Gasto sin descripción";

      const montoRaw = m[1];
      const monto = convertirCantidad(montoRaw);

      if (monto === null || monto <= 0) {
        ctx.agregarMensajeBot(
          "❌ Monto inválido. Intenta decirlo de otra forma.",
        );
        return;
      }

      const inicio = Date.now();

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

        const fin = Date.now();
        const duracion = ((fin - inicio) / 1000).toFixed(2);

        if (resp.ok) {
          ctx.agregarMensajeBot(
            `✅ Gasto registrado exitosamente con ID ${data.id_gas}`,
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
