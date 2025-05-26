import { SERVICIOS_RECETAS } from "@/services/recetas.service";
import { SERVICIOS_TRANSFORMACIONES } from "@/services/transformaciones.service";
import { format } from "date-fns";

// Mapeo de palabras a números
const palabrasANumero: Record<string, number> = {
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
};

function convertirCantidad(valor: string): number | null {
  const limpio = valor.toLowerCase().trim();
  if (palabrasANumero[limpio]) return palabrasANumero[limpio];
  const num = parseFloat(valor.replace(",", "."));
  return isNaN(num) ? null : num;
}

export const comandosDeTransformaciones = [
  {
    nombre: "realizarTransformacion",
    patron: /transformar\s+(\w+(?:[.,]?\w+)*)\s+(?:de\s+)?(.+)/i,

    handler: async (match: RegExpMatchArray, ctx: any) => {
      const valorRaw = match[1];
      const nombreReceta = match[2].toLowerCase().trim();
      const cantidad = convertirCantidad(valorRaw);

      if (cantidad === null || !Number.isInteger(cantidad)) {
        ctx.agregarMensajeBot(
          "❌ La cantidad debe ser un número entero válido.",
        );
        return;
      }

      ctx.agregarMensajeBot("⏳ Consultando recetas disponibles...");

      try {
        const resp = await fetch(SERVICIOS_RECETAS.listar);
        const recetas = await resp.json();

        if (!Array.isArray(recetas)) {
          ctx.agregarMensajeBot("❌ No se pudo obtener la lista de recetas.");
          return;
        }

        const recetaEncontrada = recetas.find((r: any) => {
          const nombreRecetaNormalizada = nombreReceta
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/\s+/g, "");

          const nombres = [r?.nom_rec, r?.prod_rec?.nom_prod];

          return nombres.some(
            (nombre) =>
              typeof nombre === "string" &&
              nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[̀-ͯ]/g, "")
                .replace(/\s+/g, "")
                .includes(nombreRecetaNormalizada),
          );
        });

        if (!recetas || recetas.length === 0) {
          ctx.agregarMensajeBot(
            <>
              ❌ No hay recetas registradas en el sistema.
              <br />
              Por favor crea al menos una receta para poder transformarla.
            </>,
          );
          return;
        }

        if (!recetaEncontrada) {
          ctx.agregarMensajeBot(
            <>
              ❌ No se encontró una receta que coincida con "{nombreReceta}".
              <br />
              Recetas disponibles:
              <ul className="mt-2 list-inside list-disc">
                {recetas
                  .filter((r: any) => r.nom_rec)
                  .map((r: any) => (
                    <li key={r.id_rec}>{r.nom_rec}</li>
                  ))}
              </ul>
            </>,
          );
          return;
        }

        ctx.agregarMensajeBot(
          `🔧 Registrando transformación de ${cantidad} de "${recetaEncontrada.nom_rec}"...`,
        );

        const payload = {
          rece_trans: recetaEncontrada.id_rec,
          cant_prod_trans: cantidad,
          usu_trans: 1,
        };

        const res = await fetch(SERVICIOS_TRANSFORMACIONES.crear, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Error al registrar transformación.");
        }

        const mensaje = `✅ Transformación registrada: ${cantidad} de ${recetaEncontrada.nom_rec}`;
        ctx.agregarMensajeBot(mensaje);

        const u = new SpeechSynthesisUtterance(mensaje);
        u.lang = "es-ES";
        window.speechSynthesis.speak(u);
      } catch (err: any) {
        ctx.agregarMensajeBot(`❌ Error: ${err.message}`);
      }
    },
  },
  {
    nombre: "transformacionesHoy",
    patron:
      /\b(qué\s+transformaciones\s+(se\s+h(i|a)cieron|hubo)|transformaciones\s+(de\s+)?(hoy|actual))\b/i,

    handler: async (_match: RegExpMatchArray, ctx: any) => {
      ctx.agregarMensajeBot("⏳ Consultando transformaciones del día...");

      try {
        const hoy = format(new Date(), "yyyy-MM-dd");
        const res = await fetch(SERVICIOS_TRANSFORMACIONES.porFecha(hoy));
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          ctx.agregarMensajeBot("📭 No se registraron transformaciones hoy.");
          return;
        }

        // Mostrar visualmente la lista
        ctx.agregarMensajeBot(
          <>
            📦 <b>Transformaciones de hoy:</b>
            <ul className="mt-1 list-inside list-disc">
              {data.map((t: any, index: number) => (
                <li key={index}>
                  {t.total} de {t.nombre_producto || t.nombre_receta}
                </li>
              ))}
            </ul>
          </>,
        );

        // Leer resumen, sin mostrarlo de nuevo
        const resumen = data
          .map(
            (t: any) => `${t.total} de ${t.nombre_producto || t.nombre_receta}`,
          )
          .join(", ");

        const u = new SpeechSynthesisUtterance(
          `Transformaciones de hoy: ${resumen}`,
        );
        u.lang = "es-ES";
        window.speechSynthesis.speak(u);
      } catch (err: any) {
        ctx.agregarMensajeBot("❌ Error al consultar transformaciones de hoy.");
      }
    },
  },
];
