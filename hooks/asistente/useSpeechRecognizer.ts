import {
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useRef } from "react";

export function useSpeechRecognizer({
  procesarTextoReconocido,
  setTextoReconocido,
}: {
  procesarTextoReconocido: (texto: string) => void;
  setTextoReconocido: (txt: string) => void;
}) {
  const reconocimientoRef = useRef<SpeechRecognizer | null>(null);

  const iniciar = () => {
    const configuracion = SpeechConfig.fromSubscription(
      process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
      process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!
    );
    configuracion.speechRecognitionLanguage = "es-ES";
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const reconocedor = new SpeechRecognizer(configuracion, audioConfig);

    reconocedor.recognizing = (_s, e) => {
      setTextoReconocido(e.result.text);
    };

    reconocedor.recognized = (_s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        procesarTextoReconocido(e.result.text);
      }
    };

    reconocedor.canceled = () => detener();
    reconocedor.sessionStopped = () => detener();

    reconocedor.startContinuousRecognitionAsync();
    reconocimientoRef.current = reconocedor;
  };

  const detener = () => {
    reconocimientoRef.current?.stopContinuousRecognitionAsync(() => {
      reconocimientoRef.current?.close();
    });
    reconocimientoRef.current = null;
  };

  return { iniciar, detener };
}
