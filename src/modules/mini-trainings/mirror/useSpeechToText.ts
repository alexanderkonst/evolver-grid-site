/**
 * useSpeechToText: browser speech-to-text (Web Speech API) for the card's microphone.
 * Nothing leaves the browser through us; the browser's own recogniser does the work.
 * Where the API is missing (Firefox, some in-app browsers) `supported` is false and the card
 * hides the microphone: the player can still type.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

type RecognitionCtor = new () => Recognition;

const getCtor = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const speechSupported = (): boolean => getCtor() !== null;

/** Append dictated text to what is already in the field, with one space between. */
export const appendSpoken = (current: string, spoken: string): string => {
  const add = spoken.trim();
  if (!add) return current;
  return current.trim() ? `${current.replace(/\s+$/, "")} ${add}` : add;
};

export function useSpeechToText(onFinalText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const cb = useRef(onFinalText);
  cb.current = onFinalText;
  const supported = speechSupported();

  const stop = useCallback(() => recRef.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    setError(null);
    const rec = new Ctor();
    rec.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const result = e.results[i];
        if (result.isFinal) finalText += result[0].transcript;
      }
      if (finalText.trim()) cb.current(finalText);
    };
    rec.onerror = (e) => {
      setError(e.error === "not-allowed" ? "Microphone access is blocked in this browser." : "The microphone could not hear you.");
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  useEffect(() => () => recRef.current?.stop(), []);

  const toggle = useCallback(() => (recRef.current ? stop() : start()), [start, stop]);

  return { supported, listening, error, toggle };
}
