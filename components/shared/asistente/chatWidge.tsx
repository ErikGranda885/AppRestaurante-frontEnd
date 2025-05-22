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
import { SERVICIOS_INVENTARIO } from "@/services/inventario.service";

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
        "👋 ¡Hola soy KAI tu asistente virtual 😎! Di 'inventario de <producto>' para consultar stock.",
    },
  ]);
  const [escuchando, setEscuchando] = useState(false);
  const [inputTexto, setInputTexto] = useState("");
  const reconocimientoRef = useRef<SpeechRecognizer | null>(null);
  const silencioTimer = useRef<number | null>(null);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      detenerAzure();
    };
  }, []);

  // Reinicia el temporizador de silencio
  const resetSilenceTimer = () => {
    if (silencioTimer.current) clearTimeout(silencioTimer.current);
    silencioTimer.current = window.setTimeout(handleSilence, 2000); // 2s sin hablar
  };

  // Al detectarse silencio
  const handleSilence = async () => {
    const textoSanitizado = inputTexto.trim().replace(/[.,!?¡¿]$/g, "");
    if (textoSanitizado) {
      agregarMensaje("usuario", textoSanitizado);
      await procesarComando(textoSanitizado.toLowerCase());
      setInputTexto("");
    }
    detenerAzure();
  };

  // Inicia reconocimiento con Azure
  const iniciarAzure = () => {
    const key = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!;
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!;
    const speechConfig = SpeechConfig.fromSubscription(key, region);
    speechConfig.speechRecognitionLanguage = "es-ES";

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    // Mientras habla → texto provisional + reinicia timer
    recognizer.recognizing = (_s, e) => {
      setInputTexto(e.result.text);
      resetSilenceTimer();
    };

    // Fragmento final reconocido → envía, detiene mic y limpia timer
    recognizer.recognized = async (_s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        const textoRaw = e.result.text.trim();
        const texto = textoRaw.replace(/[.,!?¡¿]$/g, "");
        if (texto) {
          setInputTexto("");
          agregarMensaje("usuario", texto);
          await procesarComando(texto.toLowerCase());
          detenerAzure();
        }
      }
      if (silencioTimer.current) clearTimeout(silencioTimer.current);
      silencioTimer.current = null;
    };

    recognizer.canceled = (_s, e) => {
      console.error("Reconocimiento cancelado:", e.errorDetails);
      detenerAzure();
    };

    recognizer.sessionStopped = () => {
      detenerAzure();
    };

    recognizer.startContinuousRecognitionAsync();
    reconocimientoRef.current = recognizer;
    setEscuchando(true);
  };

  // Detiene el reconocimiento y limpia todo
  const detenerAzure = () => {
    if (silencioTimer.current) {
      clearTimeout(silencioTimer.current);
      silencioTimer.current = null;
    }
    if (reconocimientoRef.current) {
      reconocimientoRef.current.stopContinuousRecognitionAsync(
        () => reconocimientoRef.current?.close(),
        (err) => console.error("Error deteniendo reconocimiento:", err),
      );
      reconocimientoRef.current = null;
    }
    setEscuchando(false);
  };

  // Alterna grabación
  const toggleGrabacion = () => {
    escuchando ? detenerAzure() : iniciarAzure();
  };

  // Síntesis de voz para respuestas
  const hablar = (texto: string) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = "es-ES";
    synth.speak(utter);
  };

  // Agrega mensaje al chat
  const agregarMensaje = (tipo: "usuario" | "asistente", texto: string) => {
    setMensajes((prev) => [...prev, { tipo, texto }]);
  };

  // Procesa comandos de voz
  const procesarComando = async (texto: string) => {
    let respuesta = "";

    // Comando: inventario de <producto>
    const matchInventario = texto.match(/^inventario de (.+)$/i);
    if (matchInventario) {
      const producto = matchInventario[1].trim();
      agregarMensaje(
        "asistente",
        `⏳ Consultando inventario de ${producto}...`,
      );
      try {
        const res = await fetch(SERVICIOS_INVENTARIO.stockPorNombre(producto));
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Error consultando inventario");
        }
        respuesta = `✅ Hay ${data.stock} unidades de ${producto}.`;
      } catch (err: any) {
        respuesta = `❌ ${err.message}`;
      }
    }
    // Otros comandos
    else if (texto.includes("listar usuarios")) {
      respuesta = "✅ Obteniendo lista de usuarios...";
    } else if (texto.includes("crear usuario")) {
      respuesta = "⚠️ Preparando flujo de creación de usuario...";
    } else if (texto.includes("coca cola")) {
      respuesta = "✅ Hay 5 unidades de Coca Cola.";
    } else if (texto.includes("cerrar asistente")) {
      respuesta = "👋 Hasta luego.";
      agregarMensaje("asistente", respuesta);
      hablar(respuesta);
      setTimeout(() => onClose(), 2000);
      return;
    } else {
      respuesta = "❌ No entendí ese comando.";
    }

    agregarMensaje("asistente", respuesta);
    hablar(respuesta);
  };

  // Envío manual del input
  const manejarEnvioManual = async () => {
    const textoSanitizado = inputTexto.trim().replace(/[.,!?¡¿]$/g, "");
    if (!textoSanitizado) return;
    agregarMensaje("usuario", textoSanitizado);
    await procesarComando(textoSanitizado.toLowerCase());
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
                className={`max-w-[80%] px-3 py-2 text-sm shadow ${
                  msg.tipo === "usuario"
                    ? "ml-auto self-end rounded-xl bg-pink-500 text-white dark:bg-pink-600"
                    : "mr-auto self-start rounded-xl bg-neutral-200 text-black dark:bg-neutral-800 dark:text-neutral-200"
                }`}
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
              placeholder="Di tu comando (ej.: inventario de Coca Cola)"
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
