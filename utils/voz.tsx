import {
  SpeechConfig,
  AudioConfig,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";

export function hablarMensaje(
  texto: string,
  voz: string = "es-MX-DaliaNeural",
) {
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
    process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!,
  );
  speechConfig.speechSynthesisVoiceName = voz;

  const synthesizer = new SpeechSynthesizer(
    speechConfig,
    AudioConfig.fromDefaultSpeakerOutput(),
  );

  synthesizer.speakTextAsync(
    texto,
    () => synthesizer.close(),
    (err) => {
      synthesizer.close();
      console.error("TTS error:", err);
    },
  );
}
