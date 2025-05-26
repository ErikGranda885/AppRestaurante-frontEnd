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

        console.log("📦 Datos recibidos de ventas:", datos);

        if (resp.ok && typeof datos.total === "number") {
          const totalFormateado = datos.total.toFixed(2);
          const fechaFormateada = fechaHoy.split("-").reverse().join("/");

          if (Number(totalFormateado) === 0) {
            const sinVentasVisual = (
              <div className="space-y-2">
                <p>
                  📅 <strong>Ventas de hoy:</strong>
                </p>
                <p>❌ No se realizaron ventas el día de hoy.</p>
              </div>
            );
            ctx.agregarMensajeBot(sinVentasVisual);

            const u = new SpeechSynthesisUtterance(
              "No se realizaron ventas el día de hoy.",
            );
            u.lang = "es-ES";
            window.speechSynthesis.speak(u);
          } else {
            const ventasVisual = (
              <div className="space-y-2">
                <p>
                  📅 <strong>Ventas de hoy:</strong>
                </p>
                <ul className="list-inside list-disc">
                  <li>
                    Fecha: <strong>{fechaFormateada}</strong>
                  </li>
                  <li>
                    Total vendido: <strong>${totalFormateado}</strong>
                  </li>
                </ul>
              </div>
            );

            ctx.agregarMensajeBot(ventasVisual);

            const u = new SpeechSynthesisUtterance(
              `El total vendido hoy es ${totalFormateado} dólares.`,
            );
            u.lang = "es-ES";
            window.speechSynthesis.speak(u);
          }
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
