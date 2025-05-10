"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { ChatWidget } from "./chatWidge"; // ajusta si tienes alias

export function AsistenteVoz() {
  const [abierto, setAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const manejarClickBoton = () => {
    if (abierto) {
      cerrarConAnimacion();
    } else {
      setAbierto(true);
    }
  };

  const cerrarConAnimacion = () => {
    setCerrando(true);
    setTimeout(() => {
      setAbierto(false);
      setCerrando(false);
    }, 250); // misma duración que AnimatePresence
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {abierto && (
        <div className="mb-2">
          <ChatWidget onClose={cerrarConAnimacion} cerrando={cerrando} />
        </div>
      )}

      <motion.button
        onClick={manejarClickBoton}
        className="rounded-md bg-white p-3 shadow-lg hover:bg-secondary dark:bg-[#121212] dark:text-white"
        animate={{
          y: [0, -3, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        }}
        title="Asistente de voz"
      >
        <Bot className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
