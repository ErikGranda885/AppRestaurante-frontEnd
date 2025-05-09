"use client";

import { useEffect, useRef, useState } from "react";
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const iniciarCamara = async () => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play();
        }
        setStream(newStream);
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
      }
    };

    if (activarCamara && !imagenActual) {
      iniciarCamara();
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [activarCamara, imagenActual]);

  const capturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvasRef.current.toDataURL("image/png");
    setFotoUrl(dataUrl);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "comprobante.png", { type: "image/png" });
        onFotoTomada(file);
      });
  };

  return (
    <div>
      {!imagenActual && !stream && (
        <Button variant="secondary" className="mt-2" disabled>
          Cargando cámara...
        </Button>
      )}

      {stream && !imagenActual && (
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

      {imagenActual && fotoUrl && (
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
