"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mic, MicOff, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useProcesadorComandos } from "@/hooks/asistente/useProcesadorComandos";
import { useSpeechRecognizer } from "@/hooks/asistente/useSpeechRecognizer";
import { MensajeBot } from "./mensajeBot";
import { hablarMensaje } from "@/utils/voz";

interface ChatWidgetProps {
  onClose: () => void;
  cerrando: boolean;
}

interface Mensaje {
  tipo: "usuario" | "asistente";
  texto: string | React.ReactNode;
  leer?: boolean;
  duracionMs?: number;
}

// Detección avanzada de emojis y pictogramas
const contieneEmoji = (texto: string) =>
  /[\p{Extended_Pictographic}\u2600-\u26FF]/u.test(texto);

// Detecta acciones de proceso
const esMensajeProceso = (texto: string) =>
  /consultando|buscando|generando|registrando|cargando|creando|procesando|validando|espera|procesando/i.test(
    texto,
  );

// Detecta si el mensaje es solo símbolos o pictogramas (sin letras/números)
const esSoloSimbolos = (texto: string) =>
  /^[\p{P}\p{S}\p{Emoji}\s]+$/u.test(texto.trim());

// Elimina emoji o pictograma inicial (más espacios opcionales)
function limpiarEmojiInicial(texto: string): string {
  return texto.replace(/^[\p{Extended_Pictographic}\u2600-\u26FF]+(\s*)/u, "");
}

export function ChatWidget({ onClose, cerrando }: ChatWidgetProps) {
  const finalRef = useRef<HTMLDivElement | null>(null);
  const [comandosMostrados, setComandosMostrados] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inicioFlujo, setInicioFlujo] = useState<number | null>(null);
  const [pendingSuggestions, setPendingSuggestions] = useState<string[] | null>(
    null,
  );
  const [escuchando, setEscuchando] = useState(false);
  const [inputTexto, setInputTexto] = useState("");
  const flowRef = useRef<any>(null);
  const setFlow = (nuevoFlow: any) => {
    flowRef.current = nuevoFlow;
  };

  const agregarMensaje = (
    tipo: "usuario" | "asistente",
    texto: string | React.ReactNode,
    leer = true,
    duracionMs?: number,
  ) => {
    setMensajes((prev) => [...prev, { tipo, texto, leer, duracionMs }]);

    // Solo lee si es texto plano y no tiene símbolos/acciones indeseadas
    if (
      tipo === "asistente" &&
      leer !== false &&
      typeof texto === "string" &&
      texto &&
      texto.length < 200 &&
      !texto.includes("\n") &&
      !esSoloSimbolos(texto) &&
      !esMensajeProceso(texto)
    ) {
      // <-- SOLO ESTE CAMBIO
      const textoSinEmoji = limpiarEmojiInicial(texto);
      if (textoSinEmoji) {
        hablarMensaje(textoSinEmoji, "es-MX-DaliaNeural");
      }
    }
  };

  const contexto = {
    flow: () => flowRef.current,
    setFlow,
    agregarMensajeBot: (t: string | React.ReactNode, leer = true) =>
      agregarMensaje("asistente", t, leer),
    obtenerInicioFlujo: () => inicioFlujo,
    setInicioFlujo,
    setPendingSuggestions,
    establecerSugerenciasPendientes: setPendingSuggestions,
    procesarEntradaDirecta: (txt: string) => procesarComando(txt),
  };

  const { procesarComando } = useProcesadorComandos({
    agregarMensaje,
    pendingSuggestions,
    setPendingSuggestions,
    contexto,
    mensajes,
    setMensajes,
  });

  const { iniciar, detener } = useSpeechRecognizer({
    procesarTextoReconocido: async (txt: string) => {
      const limpio = normalizarEntrada(txt);
      agregarMensaje("usuario", txt);
      await procesarComando(limpio);
      detener();
      setEscuchando(false);
      setInputTexto("");
    },
    setTextoReconocido: setInputTexto,
  });

  useEffect(() => {
    setTimeout(() => {
      finalRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [mensajes]);

  useEffect(() => {
    setTimeout(() => mostrarMensajeBienvenida(), 300);
    return () => detener();
  }, [comandosMostrados]);

  const mostrarMensajeBienvenida = () => {
    setMensajes((prev) => {
      const nuevaBienvenida: Mensaje = {
        tipo: "asistente",
        texto: (
          <div className="space-y-2">
            <p>👋 ¡Hola! Soy KAI, tu asistente virtual 🤖.</p>
            <p>🧠 Puedes pedirme ayuda en cualquier momento.</p>
            {!comandosMostrados ? (
              <p>
                <span
                  className="cursor-pointer text-blue-600 hover:underline dark:text-blue-400"
                  onClick={() => {
                    procesarComando("ver comandos");
                    setComandosMostrados(true);
                  }}
                >
                  🔎 Ver comandos
                </span>
              </p>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400">
                🔎 Comandos ya mostrados
              </p>
            )}
            <p>🚀 Estoy listo para ayudarte.</p>
          </div>
        ),
      };

      if (prev.length > 0 && typeof prev[0].texto !== "string") {
        return [nuevaBienvenida, ...prev.slice(1)];
      } else {
        return [nuevaBienvenida, ...prev];
      }
    });
  };

  const toggleGrabacion = () => {
    if (escuchando) {
      detener();
      setEscuchando(false);
    } else {
      // ✅ Detener voz del asistente antes de iniciar
      window.speechSynthesis.cancel();
      iniciar();
      setEscuchando(true);
    }
  };

  const normalizarEntrada = (txt: string) =>
    txt
      .toLowerCase()
      .replace(/[.,!?¡¿]+$/g, "")
      .trim();

  const manejarEnvioManual = async () => {
    const txt = inputTexto.trim();
    if (!txt) return;
    const limpio = normalizarEntrada(txt);
    agregarMensaje("usuario", txt);
    await procesarComando(limpio);
    setInputTexto("");
  };

  return (
    <AnimatePresence>
      {!cerrando && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="flex h-[500px] w-[300px] flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-xl dark:border-neutral-800 dark:bg-[#1c1c1e]"
        >
          <div className="relative flex items-center justify-between bg-neutral-100 px-4 py-2 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white dark:bg-[#121212] dark:text-white">
                <Bot className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-black dark:text-white">
                KAI (Asistente Virtual)
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-black dark:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[100%] px-3 py-2 text-sm ${
                  msg.tipo === "usuario"
                    ? "ml-auto self-end rounded-xl bg-pink-500 text-white dark:bg-pink-600"
                    : ""
                }`}
              >
                {msg.tipo === "asistente" ? (
                  <MensajeBot>{msg.texto}</MensajeBot>
                ) : (
                  msg.texto
                )}
              </div>
            ))}
            <div ref={finalRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-neutral-200 bg-neutral-100 p-2 dark:border-neutral-800 dark:bg-neutral-900">
            <input
              type="text"
              value={inputTexto}
              placeholder="Di tu comando (ej: agregar producto Dorito azul)"
              className="flex-1 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-1 text-sm text-black placeholder-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
              onChange={(e) => setInputTexto(e.target.value)}
            />
            <button
              onClick={manejarEnvioManual}
              className="rounded-xl bg-neutral-200 p-2 text-black hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              onClick={toggleGrabacion}
              className={`rounded-xl p-2 text-white ${
                escuchando ? "bg-green-600" : "bg-blue-600"
              } hover:opacity-90`}
            >
              {escuchando ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
