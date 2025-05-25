import { SERVICIOS_VENTAS } from "@/services/ventas.service";

export const comandosDeVentas = [
  {
    nombre: "ventasHoy",
    patron:
      /\b(cu[aá]nt[oó] (se )?vendi[oó]( hoy)?|ventas( de)? hoy|mostrar ventas( del d[ií]a)?)\b/i,
    handler: async (_m: RegExpMatchArray, ctx: any) => {
      ctx.agregarMensajeBot("⏳ Consultando ventas de hoy...");
      try {
        const hoy = new Date();
        const fechaHoy = `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${hoy.getDate().toString().padStart(2, "0")}`;

        const resp = await fetch(SERVICIOS_VENTAS.totalPorFecha(fechaHoy));
        const datos = await resp.json();

        if (resp.ok && typeof datos.total === "number") {
          ctx.agregarMensajeBot(
            `✅ El total de ventas de hoy es $${datos.total.toFixed(2)}.`,
          );
        } else {
          ctx.agregarMensajeBot(
            "❌ No se pudo obtener el total de ventas de hoy.",
          );
        }
      } catch (e: any) {
        ctx.agregarMensajeBot(`❌ Error al consultar ventas: ${e.message}`);
      }
    },
  },
];
