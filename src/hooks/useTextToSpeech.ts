import { useState, useCallback } from 'react';
import { speak as elevenlabsSpeak, stopCurrentAudio } from '../lib/elevenlabs';

interface UseTextToSpeechResult {
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  speakSlow: (text: string) => Promise<void>;
  stop: () => void;
}

export function useTextToSpeech(): UseTextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      await elevenlabsSpeak(text, false);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const speakSlow = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      await elevenlabsSpeak(text, true);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    stopCurrentAudio();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, speakSlow, stop };
}
