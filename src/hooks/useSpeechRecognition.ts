import { useState, useRef, useCallback, type MutableRefObject } from 'react';

interface UseSpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  transcriptRef: MutableRefObject<string>;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldKeepListening = useRef(false);
  const accumulatedTranscript = useRef('');
  const transcriptRef = useRef('');

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  const startRecognition = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0].transcript;

        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) accumulatedTranscript.current += final;
      const latest = accumulatedTranscript.current + interim;
      transcriptRef.current = latest;
      setTranscript(latest);
    };

    recognition.onend = () => {
      if (shouldKeepListening.current) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: Event) => {
      const errorEvent = event as ErrorEvent;
      const err = errorEvent.message ?? '';

      if (shouldKeepListening.current && err !== 'not-allowed') {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    accumulatedTranscript.current = '';
    transcriptRef.current = '';
    setTranscript('');
    shouldKeepListening.current = true;
    startRecognition();
  }, [isSupported, startRecognition]);

  const stopListening = useCallback(() => {
    shouldKeepListening.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    accumulatedTranscript.current = '';
    transcriptRef.current = '';
    setTranscript('');
  }, []);

  return { isListening, transcript, transcriptRef, isSupported, startListening, stopListening, resetTranscript };
}
