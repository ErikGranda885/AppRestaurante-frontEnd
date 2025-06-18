"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mic, MicOff, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";
import { FlowProducto, handleFlowProducto } from "../comandos/productos";
import { allCommands } from "../comandos";
import { FlowVenta, handleFlowVenta } from "../comandos/ventas";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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

export function ChatWidget({ onClose, cerrando }: ChatWidgetProps) {
  const finalRef = useRef<HTMLDivElement | null>(null);
  const [comandosMostrados, setComandosMostrados] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

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

      // Reemplaza solo si ya existe un mensaje de bienvenida (primero), si no, agrega
      if (prev.length > 0 && typeof prev[0].texto !== "string") {
        return [nuevaBienvenida, ...prev.slice(1)];
      } else {
        return [nuevaBienvenida, ...prev];
      }
    });
  };

  useEffect(() => {
    mostrarMensajeBienvenida();
    return () => detenerAzure();
  }, [comandosMostrados]);

  useEffect(() => {
    const delay = setTimeout(() => {
      finalRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    return () => clearTimeout(delay);
  }, [mensajes]);
  const [inicioFlujo, setInicioFlujo] = useState<number | null>(null);
  const [pendingSuggestions, setPendingSuggestions] = useState<string[] | null>(
    null,
  );
  const [flowProducto, setFlowProducto] = useState<FlowProducto | null>(null);
  const [flowVenta, setFlowVenta] = useState<FlowVenta | null>(null);

  const [escuchando, setEscuchando] = useState(false);
  const [inputTexto, setInputTexto] = useState("");
  const reconocimientoRef = useRef<SpeechRecognizer | null>(null);
  const silencioTimer = useRef<number | null>(null);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[-.,!?¡¿]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const contexto = {
    agregarMensajeBot: (t: string | React.ReactNode) =>
      agregarMensaje("asistente", t),
    establecerSugerenciasPendientes: setPendingSuggestions,
    setFlow: (flow: FlowProducto | FlowVenta | null) => {
      if (flow === null) {
        setFlowProducto(null);
        setFlowVenta(null);
        setInicioFlujo(null); // 🧹 Limpia cuando termina el flujo
        return;
      }

      const pasosDeVenta = [
        "categoria",
        "producto",
        "cantidad",
        "agregarOtro", // ✅ Agregado
        "pago",
        "montoEfectivo",
        "comprobante",
        "confirmacion",
      ];

      const esInicio = flow.step === "categoria";
      if (pasosDeVenta.includes(flow.step)) {
        setFlowVenta(flow as FlowVenta);
        setFlowProducto(null);
        if (esInicio) setInicioFlujo(Date.now()); // 🟢 Marca inicio
      } else {
        setFlowProducto(flow as FlowProducto);
        setFlowVenta(null);
      }
    },
    obtenerInicioFlujo: () => inicioFlujo, // ✅ ESTO FALTABA
  };

  useEffect(() => () => detenerAzure(), []);

  const resetSilenceTimer = () => {
    if (silencioTimer.current) clearTimeout(silencioTimer.current);
    silencioTimer.current = window.setTimeout(handleSilence, 2000);
  };
  const handleSilence = async () => {
    const txt = inputTexto.trim().replace(/[.,!?¡¿]$/g, "");
    if (txt) {
      agregarMensaje("usuario", txt);
      await procesarComando(txt.toLowerCase());
      setInputTexto("");
    }
    detenerAzure();
  };

  const iniciarAzure = () => {
    window.speechSynthesis.cancel();
    const speechConfig = SpeechConfig.fromSubscription(
      process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
      process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!,
    );
    speechConfig.speechRecognitionLanguage = "es-ES";
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    recognizer.recognizing = (_s, e) => {
      setInputTexto(e.result.text);
      resetSilenceTimer();
    };
    recognizer.recognized = async (_s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        const raw = e.result.text.trim();
        const txt = raw.replace(/[.,!?¡¿]$/g, "");
        if (txt) {
          setInputTexto("");
          agregarMensaje("usuario", txt);
          await procesarComando(txt.toLowerCase());
          detenerAzure();
        }
      }
      if (silencioTimer.current) clearTimeout(silencioTimer.current);
      silencioTimer.current = null;
    };
    recognizer.canceled = () => detenerAzure();
    recognizer.sessionStopped = () => detenerAzure();
    recognizer.startContinuousRecognitionAsync();
    reconocimientoRef.current = recognizer;
    setEscuchando(true);
  };

  const detenerAzure = () => {
    if (silencioTimer.current) {
      clearTimeout(silencioTimer.current);
      silencioTimer.current = null;
    }
    if (reconocimientoRef.current) {
      reconocimientoRef.current.stopContinuousRecognitionAsync(
        () => reconocimientoRef.current?.close(),
        () => {},
      );
      reconocimientoRef.current = null;
    }
    setEscuchando(false);
  };

  const toggleGrabacion = () => (escuchando ? detenerAzure() : iniciarAzure());

  const agregarMensaje = (
    tipo: "usuario" | "asistente",
    texto: string | React.ReactNode,
    leer = true,
    duracionMs?: number,
  ) => {
    setMensajes((prev) => [...prev, { tipo, texto, leer, duracionMs }]);

    const debeLeer =
      tipo === "asistente" &&
      typeof texto === "string" &&
      leer &&
      texto.length < 200 &&
      !texto.includes("\n");

    if (debeLeer) {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "es-ES";
      window.speechSynthesis.speak(u);
    }
  };

  const procesarComando = async (texto: string) => {
    const textoNormalizado = normalize(texto);
    const inicio = Date.now();

    const manejarFlujoVenta = async (texto: string): Promise<boolean> => {
      if (!flowVenta) return false;

      setInputTexto("");
      const ref = flowVenta;
      await handleFlowVenta(texto, ref, contexto as any);

      if (!flowVenta) setPendingSuggestions(null);
      return true;
    };

    const handlers: (() => Promise<boolean> | boolean)[] = [
      () => manejarCancelacion(texto),
      () => manejarFlujoProducto(texto),
      () => manejarFlujoVenta(texto),
      () => manejarSugerencia(textoNormalizado),
      () => manejarComando(texto),
      () => manejarCierreAsistente(texto),
    ];

    const indexAntes = mensajes.length;

    for (const handler of handlers) {
      const resultado = await handler();
      if (resultado) {
        const fin = Date.now();
        const duracion = fin - inicio;

        setMensajes((prev) => {
          const copy = [...prev];
          // Busca el último mensaje del asistente que no tenga duración aún
          for (let i = copy.length - 1; i >= indexAntes; i--) {
            if (
              copy[i].tipo === "asistente" &&
              copy[i].duracionMs === undefined
            ) {
              copy[i] = { ...copy[i], duracionMs: duracion };
              break;
            }
          }
          return copy;
        });

        return;
      }
    }

    const fin = performance.now();
    const duracion = fin - inicio;
    agregarMensaje("asistente", "❌ No entendí ese comando.", true, duracion);
  };

  const manejarCancelacion = (texto: string): boolean => {
    if (!/cancelar|detener|salir/i.test(texto)) return false;

    agregarMensaje("asistente", "🚫 Flujo cancelado por el usuario.");
    setFlowProducto(null);
    setPendingSuggestions(null);
    return true;
  };

  const manejarFlujoProducto = async (texto: string): Promise<boolean> => {
    if (!flowProducto) return false;

    setInputTexto("");
    const ref = flowProducto;
    await handleFlowProducto(texto, ref, contexto as any);

    if (!flowProducto) setPendingSuggestions(null);
    return true;
  };

  const manejarSugerencia = async (texto: string): Promise<boolean> => {
    if (!pendingSuggestions) return false;

    const match = pendingSuggestions.find((s) => normalize(s) === texto);
    if (match) {
      setPendingSuggestions(null);
      await procesarComando(`inventario de ${match}`);
      return true;
    }

    const encontrado = await manejarComando(texto);
    if (encontrado) return true;

    agregarMensaje(
      "asistente",
      `❌ No reconozco esa opción. Dime uno de: ${pendingSuggestions.join(", ")}`,
    );
    return true;
  };

  const manejarComando = async (texto: string): Promise<boolean> => {
    for (const cmd of allCommands) {
      const match = texto.match(cmd.patron);
      if (match) {
        await cmd.handler(match, contexto as any);
        return true;
      }
    }
    return false;
  };

  const manejarCierreAsistente = (texto: string): boolean => {
    if (!texto.includes("cerrar asistente")) return false;

    agregarMensaje("asistente", "👋 Hasta luego.");
    setTimeout(onClose, 2000);
    return true;
  };

  const manejarEnvioManual = async () => {
    const txt = inputTexto.trim().replace(/[.,!?¡¿]$/g, "");
    if (!txt) return;
    agregarMensaje("usuario", txt);
    await procesarComando(txt.toLowerCase());
    setInputTexto("");
  };
  function formatearDuracion(ms: number | undefined) {
    if (ms === undefined) return "";

    const totalSeconds = Math.floor(ms / 1000);
    const horas = Math.floor(totalSeconds / 3600);
    const minutos = Math.floor((totalSeconds % 3600) / 60);
    const segundos = totalSeconds % 60;

    const hh = horas.toString().padStart(2, "0");
    const mm = minutos.toString().padStart(2, "0");
    const ss = segundos.toString().padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  }

  return (
    <AnimatePresence>
      {!cerrando && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="flex h-[500px] w-[340px] flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-xl dark:border-neutral-800 dark:bg-[#1c1c1e]"
        >
          {/* Header */}
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
          {/* Mensajes */}
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 text-sm shadow ${
                  msg.tipo === "usuario"
                    ? "ml-auto self-end rounded-xl bg-pink-500 text-white dark:bg-pink-600"
                    : "mr-auto self-start rounded-xl bg-neutral-200 text-black dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                }`}
              >
                {msg.texto}
              </div>
            ))}
            {/* 👇 Ref de scroll automático */}
            <div ref={finalRef} />
          </div>

          {/* Input + botones */}
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
              className={`rounded-xl p-2 text-white ${escuchando ? "bg-green-600" : "bg-blue-600"} hover:opacity-90`}
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
