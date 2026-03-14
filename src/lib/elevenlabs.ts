// ElevenLabs TTS with browser speech synthesis fallback

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
const VOICE_ID = 'cjVigY5qzO86Huf0OWal'; // matches the preset voice on the ElevenLabs agent

let currentAudio: HTMLAudioElement | null = null;

export function stopCurrentAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (typeof window !== 'undefined') {
    window.speechSynthesis.cancel();
  }
}

async function playWithElevenLabs(text: string, slow = false): Promise<void> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, speed: slow ? 0.7 : 1.0 },
    }),
  });

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      reject(new Error('Audio playback failed'));
    };
    audio.play().catch(reject);
  });
}

function playWithBrowser(text: string, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Prefer a warm female voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && /samantha|karen|victoria|zira|susan/i.test(v.name),
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function speak(text: string, slow = false): Promise<void> {
  stopCurrentAudio();

  if (ELEVENLABS_API_KEY) {
    try {
      await playWithElevenLabs(text, slow);
      return;
    } catch {
      // fall through to browser TTS
    }
  }

  await playWithBrowser(text, slow ? 0.65 : 0.9);
}
