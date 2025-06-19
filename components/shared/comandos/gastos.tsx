import { SERVICIOS_GASTOS } from "@/services/gastos.service";

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
    patron: /^registrar gasto[,:]?\s*(.+?)(?:\s+por\s+(.+))?$/i,
    handler: async (m: RegExpMatchArray, ctx: any) => {
      const descripcion = m[2] || "Gasto sin descripción";

      // 🔁 Convertidor de texto a número, con coma/palabras
      const textoANumero = (texto: string): number | null => {
        // Si es un número tipo "5,85" o "3.50", convertir directamente
        const directo = parseFloat(texto.replace(",", "."));
        if (!isNaN(directo)) return directo;

        const mapa: Record<string, string> = {
          uno: "1",
          una: "1",
          un: "1",
          dos: "2",
          tres: "3",
          cuatro: "4",
          cinco: "5",
          seis: "6",
          siete: "7",
          ocho: "8",
          nueve: "9",
          diez: "10",
          veinte: "20",
          treinta: "30",
          cuarenta: "40",
          cincuenta: "50",
          sesenta: "60",
          setenta: "70",
          ochenta: "80",
          noventa: "90",
          cien: "100",
          dólar: "",
          dolares: "",
          con: ".",
          punto: ".",
          y: ".",
        };

        const tokens = texto
          .toLowerCase()
          .replace(/[^\w\s.,]/gi, "") // permite coma y punto
          .split(/\s+/)
          .map((t) => mapa[t] ?? t);

        const expresion = tokens.join("").replace(",", ".");
        const numero = parseFloat(expresion);
        return isNaN(numero) ? null : numero;
      };

      const montoRaw = m[1];
      const monto = textoANumero(montoRaw);

      if (monto === null || monto <= 0) {
        ctx.agregarMensajeBot(
          "❌ Monto inválido. Intenta decirlo de otra forma.",
        );
        return;
      }

      ctx.agregarMensajeBot(
        `⏳ Registrando gasto de $${monto.toFixed(2)} por "${descripcion}"...`,
      );

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
            `✅ Gasto registrado correctamente con ID ${data.id_gas} en ${duracion} segundos.`,
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
