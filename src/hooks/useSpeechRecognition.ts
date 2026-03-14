import { useState, useRef, useCallback, type MutableRefObject } from 'react';

interface UseSpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  transcriptRef: MutableRefObject<string>;
  isSupported: boolean;
  error: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const shouldKeepListening = useRef(false);
  const accumulatedTranscript = useRef('');
  const transcriptRef = useRef('');

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoStop = useCallback((delayMs: number) => {
    clearSilenceTimeout();
    silenceTimeoutRef.current = window.setTimeout(() => {
      shouldKeepListening.current = false;
      recognitionRef.current?.stop();
    }, delayMs);
  }, [clearSilenceTimeout]);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  const startRecognition = useCallback(async () => {
    const SpeechRecognitionAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not available in this browser.');
      return;
    }

    setError('');

    try {
      await navigator.mediaDevices?.getUserMedia?.({ audio: true });
    } catch {
      setError('Microphone permission is blocked. Please allow microphone access and try again.');
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError('');
      setIsListening(true);
      scheduleAutoStop(5000);
    };

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
      scheduleAutoStop(1400);
    };

    recognition.onend = () => {
      clearSilenceTimeout();
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
      const speechEvent = event as Event & { error?: string; message?: string };
      const err = speechEvent.error ?? speechEvent.message ?? '';

      if (err === 'not-allowed' || err === 'service-not-allowed') {
        setError('Microphone permission is blocked. Please allow microphone access and try again.');
      } else if (err === 'no-speech') {
        setError('We did not hear anything. Try speaking a little closer to the microphone.');
      } else if (err === 'audio-capture') {
        setError('No microphone was found. Check your device microphone and browser settings.');
      } else if (err) {
        setError(`Microphone error: ${err}`);
      }

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
    void startRecognition();
  }, [isSupported, startRecognition]);

  const stopListening = useCallback(() => {
    shouldKeepListening.current = false;
    clearSilenceTimeout();
    recognitionRef.current?.stop();
    // Do NOT call setIsListening(false) here.
    // recognition.onend fires after all pending onresult events, so letting
    // it set isListening=false guarantees the transcript is complete before
    // any effect that depends on isListening transitioning to false.
  }, []);

  const resetTranscript = useCallback(() => {
    accumulatedTranscript.current = '';
    transcriptRef.current = '';
    setTranscript('');
    setError('');
    clearSilenceTimeout();
  }, [clearSilenceTimeout]);

  return { isListening, transcript, transcriptRef, isSupported, error, startListening, stopListening, resetTranscript };
}
