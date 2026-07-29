import { useRef, useState, useCallback, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

function getSpeechRecognition(): AnySpeechRecognition | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useAccessibility(enabled: boolean) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const recognitionRef = useRef<AnySpeechRecognition>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    setSttSupported(!!getSpeechRecognition());
  }, []);

  const stopSpeaking = useCallback(() => {
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!enabled) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.lang = 'en-NG';
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith('en')) ?? null;
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utterance);
  }, [enabled]);

  // Speak an array of strings in sequence
  const speakQueue = useCallback((texts: string[], onAllDone?: () => void) => {
    cancelledRef.current = false;
    const go = (idx: number) => {
      if (cancelledRef.current || idx >= texts.length) {
        if (!cancelledRef.current) onAllDone?.();
        return;
      }
      speak(texts[idx], () => go(idx + 1));
    };
    go(0);
  }, [speak]);

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    if (!enabled) return;
    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (e: AnySpeechRecognition) => {
      const transcript: string = e.results[0]?.[0]?.transcript ?? '';
      setIsListening(false);
      onResult(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [enabled]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { speak, speakQueue, stopSpeaking, startListening, stopListening, isSpeaking, isListening, sttSupported };
}

// Maps a voice transcript to an answer option index (0–3), or null if unrecognised
export function matchVoiceToOption(transcript: string, options: string[]): number | null {
  const t = transcript.trim().toLowerCase();

  const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

  // Single letter: "a", "b", "c", "d"
  if (letterMap[t] !== undefined) return letterMap[t];

  // "option a", "answer b", etc.
  const embedded = t.match(/\b([abcd])\b/)?.[1];
  if (embedded) return letterMap[embedded];

  // Number words / ordinals
  const ordinals: Record<string, number> = {
    one: 0, first: 0, '1': 0,
    two: 1, second: 1, '2': 1,
    three: 2, third: 2, '3': 2,
    four: 3, fourth: 3, '4': 3,
  };
  for (const [word, idx] of Object.entries(ordinals)) {
    if (t.includes(word)) return idx;
  }

  // Fuzzy: ≥2 meaningful words match against option text
  for (let i = 0; i < options.length; i++) {
    const optWords = options[i].toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const tWords = t.split(/\s+/);
    const hits = optWords.filter((w) => tWords.some((tw) => tw.includes(w) || w.includes(tw)));
    if (hits.length >= Math.min(2, optWords.length)) return i;
  }

  return null;
}
