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
import {
  comandosDeProductos,
  FlowProducto,
  handleFlowProducto,
} from "../comandos/productos";

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
  texto: string;
}

export function ChatWidget({ onClose, cerrando }: ChatWidgetProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      tipo: "asistente",
      texto:
        "👋 ¡Hola soy KAI tu asistente virtual 😎! Di 'inventario de <producto>' o 'agregar producto <nombre>'.",
    },
  ]);
  const [pendingSuggestions, setPendingSuggestions] = useState<string[] | null>(
    null,
  );
  const [flowProducto, setFlowProducto] = useState<FlowProducto | null>(null);
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
    agregarMensajeBot: (t: string) => agregarMensaje("asistente", t),
    establecerSugerenciasPendientes: setPendingSuggestions,
    setFlow: setFlowProducto,
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

  const agregarMensaje = (tipo: "usuario" | "asistente", texto: string) => {
    setMensajes((prev) => [...prev, { tipo, texto }]);

    const debeLeer =
      tipo === "asistente" &&
      !texto.startsWith("⏳") &&
      texto.length < 150 &&
      !texto.includes("\n") &&
      (texto.startsWith("✅") ||
        texto.startsWith("❌") ||
        texto.startsWith("👋") ||
        texto.startsWith("🚫") ||
        texto.startsWith("⚠️"));

    if (debeLeer) {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "es-ES";
      window.speechSynthesis.speak(u);
    }
  };

  const procesarComando = async (texto: string) => {
    if (/cancelar|detener|salir/i.test(texto)) {
      agregarMensaje("asistente", "🚫 Flujo cancelado por el usuario.");
      setFlowProducto(null);
      setPendingSuggestions(null);
      return;
    }

    if (flowProducto) {
      const flowRef = flowProducto; // capturar referencia actual
      await handleFlowProducto(texto, flowRef, contexto as any);

      // Verifica si el flujo fue cerrado durante la ejecución
      if (flowProducto !== null) return;
    }

    if (pendingSuggestions) {
      const sel = normalize(texto);
      const match = pendingSuggestions.find((s) => normalize(s) === sel);

      if (match) {
        setPendingSuggestions(null);
        await procesarComando(`inventario de ${match}`);
        return;
      }

      // Revisa si el texto coincide con un nuevo comando, ignorando la sugerencia
      for (const cmd of comandosDeProductos) {
        const m = texto.match(cmd.patron);
        if (m) {
          setPendingSuggestions(null);
          await cmd.handler(m, contexto as any);
          return;
        }
      }

      // Si no es sugerencia ni comando válido
      agregarMensaje(
        "asistente",
        `❌ No reconozco esa opción. Dime uno de: ${pendingSuggestions.join(", ")}`,
      );
      return;
    }

    for (const cmd of comandosDeProductos) {
      const m = texto.match(cmd.patron);
      if (m) {
        await cmd.handler(m, contexto as any);
        return;
      }
    }
    if (texto.includes("cerrar asistente")) {
      agregarMensaje("asistente", "👋 Hasta luego.");
      setTimeout(onClose, 2000);
      return;
    }
    agregarMensaje("asistente", "❌ No entendí ese comando.");
  };

  const manejarEnvioManual = async () => {
    const txt = inputTexto.trim().replace(/[.,!?¡¿]$/g, "");
    if (!txt) return;
    agregarMensaje("usuario", txt);
    await procesarComando(txt.toLowerCase());
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
                className={`max-w-[80%] px-3 py-2 text-sm shadow ${msg.tipo === "usuario" ? "ml-auto self-end rounded-xl bg-pink-500 text-white dark:bg-pink-600" : "mr-auto self-start rounded-xl bg-neutral-200 text-black dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"}`}
              >
                {msg.texto}
              </div>
            ))}
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
