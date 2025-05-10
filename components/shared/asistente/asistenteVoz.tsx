"use client";
import { useState } from "react";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { ChatWidget } from "./chatWidge"; // Ajusta la ruta si usas alias

export function AsistenteVoz() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="flex flex-col items-end space-y-2">
      {/* Chat por encima del botón */}
      {abierto && (
        <div className="mb-2">
          <ChatWidget onClose={() => setAbierto(false)} />
        </div>
      )}

      {/* Botón flotante con ícono de robot */}
      <motion.button
        onClick={() => setAbierto(true)}
        className="rounded-md bg-white p-2 shadow-lg hover:bg-secondary dark:bg-[#121212] dark:text-white"
        animate={{
          y: [0, -3, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        }}
        title="Abrir asistente"
      >
        <Bot className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
