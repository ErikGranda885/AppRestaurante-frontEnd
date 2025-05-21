"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ComprobanteCamaraProps {
  onFotoTomada: (file: File | null) => void;
  imagenActual: File | null;
  activarCamara: boolean;
}

export default function ComprobanteCamara({
  onFotoTomada,
  imagenActual,
  activarCamara,
}: ComprobanteCamaraProps) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [cargandoCamara, setCargandoCamara] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const iniciarCamara = useCallback(async () => {
    try {
      setCargandoCamara(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
    } finally {
      setCargandoCamara(false);
    }
  }, []);

  // Carga imagen si ya existe y genera la vista previa
  useEffect(() => {
    if (imagenActual) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(imagenActual);
    } else {
      setFotoUrl(null);
    }
  }, [imagenActual]);

  // Activación automática de cámara si no hay imagen ni foto
  useEffect(() => {
    if (activarCamara && !imagenActual && !fotoUrl && !streamRef.current) {
      iniciarCamara();
    }
    return () => {
      detenerCamara();
    };
  }, [activarCamara, imagenActual, fotoUrl, iniciarCamara]);

  const capturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvasRef.current.toDataURL("image/png");
    setFotoUrl(dataUrl);
    detenerCamara();

    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "comprobante.png", { type: "image/png" });
        onFotoTomada(file);
      });
  };

  return (
    <div>
      {cargandoCamara && (
        <Button variant="secondary" className="mt-2" disabled>
          Cargando cámara...
        </Button>
      )}

      {!imagenActual && streamRef.current && !fotoUrl && (
        <div className="mt-2">
          <video
            ref={videoRef}
            className="w-full rounded-md"
            autoPlay
            muted
            playsInline
          />
          <Button variant="primary" className="mt-2" onClick={capturarFoto}>
            Capturar foto
          </Button>
        </div>
      )}

      {fotoUrl && (
        <div className="mt-3 rounded border border-border p-2">
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
            Previsualización:
          </p>
          <img
            src={fotoUrl}
            alt="Foto tomada"
            className="max-h-48 w-auto rounded-md border border-border object-contain"
          />
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              setFotoUrl(null);
              onFotoTomada(null);
              iniciarCamara();
            }}
          >
            Reintentar
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
