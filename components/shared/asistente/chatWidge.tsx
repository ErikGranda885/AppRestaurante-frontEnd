"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mic, MicOff, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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
        "👋 ¡Hola soy KAI tu asistente virtual 😎! ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [escuchando, setEscuchando] = useState(false);
  const [inputTexto, setInputTexto] = useState("");
  const reconocimientoRef = useRef<any>(null);

  useEffect(() => {
    iniciarReconocimiento();
    return () => reconocimientoRef.current?.stop?.();
  }, []);

  const iniciarReconocimiento = () => {
    const ReconocimientoVoz =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!ReconocimientoVoz) return;

    const reconocimiento = new ReconocimientoVoz();
    reconocimiento.lang = "es-ES";
    reconocimiento.interimResults = true;

    reconocimiento.onstart = () => setEscuchando(true);
    reconocimiento.onend = () => setEscuchando(false);

    let textoParcial = "";

    reconocimiento.onresult = (event: any) => {
      textoParcial = event.results[0][0].transcript;
      actualizarUltimoMensajeUsuario(textoParcial);

      if (event.results[0].isFinal) {
        agregarMensaje("usuario", textoParcial);
        procesarComando(textoParcial.toLowerCase());
      }
    };

    reconocimiento.start();
    reconocimientoRef.current = reconocimiento;
  };

  const detenerReconocimiento = () => {
    reconocimientoRef.current?.stop?.();
    setEscuchando(false);
  };

  const toggleGrabacion = () => {
    escuchando ? detenerReconocimiento() : iniciarReconocimiento();
  };

  const hablar = (texto: string) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(texto);
    synth.speak(utter);
  };

  const agregarMensaje = (tipo: "usuario" | "asistente", texto: string) => {
    setMensajes((prev) => [...prev, { tipo, texto }]);
  };

  const actualizarUltimoMensajeUsuario = (texto: string) => {
    setMensajes((prev) => {
      const actual = [...prev];
      const idx = actual.findIndex(
        (m) => m.tipo === "usuario" && m.texto.endsWith("..."),
      );
      if (idx >= 0) {
        actual[idx].texto = texto + "...";
      } else {
        actual.push({ tipo: "usuario", texto: texto + "..." });
      }
      return actual;
    });
  };

  const procesarComando = (texto: string) => {
    let respuesta = "";
    if (texto.includes("coca cola")) {
      respuesta = "✅ Hay 5 unidades de Coca Cola.";
    } else if (texto.includes("registrar")) {
      respuesta = "⚠️ Comando de venta recibido. Procesando...";
    } else if (texto.includes("cerrar asistente")) {
      respuesta = "👋 Hasta luego.";
      hablar(respuesta);
      setMensajes((prev) => [...prev, { tipo: "asistente", texto: respuesta }]);
      setTimeout(() => onClose(), 2000);
      return;
    } else {
      respuesta = "❌ Lo siento, no entendí ese comando.";
    }
    setMensajes((prev) => [...prev, { tipo: "asistente", texto: respuesta }]);
    hablar(respuesta);
  };

  const manejarEnvioManual = () => {
    if (!inputTexto.trim()) return;
    agregarMensaje("usuario", inputTexto);
    procesarComando(inputTexto.toLowerCase());
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
                    ? "ml-auto self-end rounded-xl bg-pink-500 text-white shadow-md dark:bg-pink-600"
                    : "mr-auto self-start rounded-xl bg-neutral-200 text-black shadow-sm dark:bg-neutral-800 dark:text-neutral-200"
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
              onChange={(e) => setInputTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && manejarEnvioManual()}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-1 text-sm text-black placeholder-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
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
