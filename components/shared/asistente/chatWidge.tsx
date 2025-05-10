"use client";
import { useEffect, useRef, useState } from "react";
import { X, Mic, MicOff, Send } from "lucide-react";
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
}

interface Mensaje {
  tipo: "usuario" | "asistente";
  texto: string;
}

export function ChatWidget({ onClose }: ChatWidgetProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      tipo: "asistente",
      texto:
        "👋 ¡Hola soy KAI tu asistente virtual 😎!  ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [escuchando, setEscuchando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [inputTexto, setInputTexto] = useState("");
  const reconocimientoRef = useRef<any>(null);

  useEffect(() => {
    iniciarReconocimiento(); // auto inicia al abrir
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
      setTimeout(() => cerrarConAnimacion(), 2000);
      return;
    } else {
      respuesta = "❌ Lo siento, no entendí ese comando.";
    }

    setMensajes((prev) => [...prev, { tipo: "asistente", texto: respuesta }]);
    hablar(respuesta);
  };

  const cerrarConAnimacion = () => {
    setCerrando(true);
    setTimeout(() => onClose(), 250);
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
          className="flex h-[500px] w-80 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-2xl"
        >
          {/* Encabezado */}
          <div className="relative rounded-t-xl bg-[#121212] px-4 py-2 text-white">
            <span className="font-semibold">Asistente Virtual</span>
            <Button
              variant={"ghost"}
              onClick={cerrarConAnimacion}
              className="absolute right-2 text-white transition hover:text-gray-200"
              title="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow ${
                  msg.tipo === "usuario"
                    ? "ml-auto self-end bg-pink-100 text-right text-pink-900"
                    : "mr-auto self-start border bg-white text-gray-700"
                }`}
              >
                {msg.texto}
              </div>
            ))}
          </div>

          {/* Input de texto + micrófono */}
          <div className="flex items-center gap-2 border-t bg-white p-2">
            <input
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && manejarEnvioManual()}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-md border px-3 py-1 text-sm focus:outline-none"
            />
            <button
              onClick={manejarEnvioManual}
              className="rounded bg-pink-600 p-2 text-white hover:bg-pink-700"
              title="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              onClick={toggleGrabacion}
              className={`rounded p-2 text-white ${
                escuchando ? "bg-green-600" : "bg-blue-600"
              } hover:opacity-90`}
              title={escuchando ? "Detener grabación" : "Iniciar grabación"}
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
