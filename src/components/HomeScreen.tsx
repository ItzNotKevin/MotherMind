import { useEffect, type MouseEvent } from 'react';
import {
  ArrowDown,
  Languages,
  MessageCircleMore,
  MousePointer2,
  Smartphone,
  UserRound,
  Volume2,
} from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { ROHINGYA_UI } from '../lib/rohingya';

interface HomeScreenProps {
  onContinue: () => void;
}

const WELCOME_AUDIO =
  'Welcome to MotherMind. This is a calm space to practice English. Tap the large button to start. Then choose a topic. Listen first, speak next, and repeat anytime.';

export function HomeScreen({ onContinue }: HomeScreenProps) {
  const { isSpeaking, speak, stop } = useTextToSpeech();

  useEffect(() => stop, [stop]);

  const handleAudioClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isSpeaking) {
      stop();
      return;
    }

    void speak(WELCOME_AUDIO);
  };

  return (
    <section className="animate-fade-in">
      <div
        className="glass-panel overflow-hidden rounded-[2.25rem] border border-white/70 shadow-sm"
        style={{
          background:
            'linear-gradient(160deg, rgba(255, 252, 247, 0.97) 0%, rgba(246, 238, 226, 0.92) 55%, rgba(239, 247, 243, 0.92) 100%)',
        }}
      >
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] lg:p-8">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                MotherMind
              </div>

              <h2 className="max-w-[7ch] text-6xl font-semibold leading-[0.9] tracking-tight text-slate-900 sm:text-7xl">
                Tap. Speak. Repeat.
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/82 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="block">Listen</span>
                <span className="block text-[0.72rem] font-medium opacity-75">{ROHINGYA_UI.listen}</span>
              </span>
              <span className="rounded-full bg-white/82 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="block">Speak</span>
                <span className="block text-[0.72rem] font-medium opacity-75">{ROHINGYA_UI.speak}</span>
              </span>
              <span className="rounded-full bg-white/82 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="block">Repeat</span>
                <span className="block text-[0.72rem] font-medium opacity-75">{ROHINGYA_UI.repeat}</span>
              </span>
            </div>
          </div>

          <div className="relative flex min-h-[400px] items-center justify-center rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(245,235,223,0.72))] p-5">
            <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Calm
            </div>
            <div className="absolute bottom-5 right-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Voice
            </div>

            <div className="absolute left-8 top-24 h-20 w-20 rounded-[2rem] bg-white/85 p-4 shadow-sm">
              <div className="flex h-full items-center justify-center rounded-[1.3rem] bg-[#d46b4d]/12">
                <Volume2 size={28} className="text-[#d46b4d]" />
              </div>
            </div>

            <div className="absolute right-8 top-20 rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3d8f87]" />
                <span>Hello</span>
              </div>
            </div>

            <div className="absolute right-12 top-40 rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5874c9]" />
                <span>Thank you</span>
              </div>
            </div>

            <div className="absolute right-8 bottom-24 rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Languages size={16} className="text-[#3d8f87]" />
                <span>English</span>
              </div>
            </div>

            <div className="relative h-[320px] w-[330px]">
              <div className="absolute bottom-8 left-6 h-40 w-36 rounded-[2.4rem] bg-[#d46b4d] shadow-[0_18px_32px_rgba(212,107,77,0.28)]" />
              <div className="absolute bottom-36 left-11 flex h-28 w-28 items-center justify-center rounded-full bg-[#f4ccb0] shadow-sm">
                <UserRound size={60} strokeWidth={1.6} className="text-[#364152]" />
              </div>
              <div className="absolute bottom-14 left-[7.4rem] flex h-16 w-12 rotate-[-16deg] items-center justify-center rounded-full bg-[#f4ccb0]" />

              <div className="absolute bottom-14 left-[8.7rem] flex h-24 w-16 items-center justify-center rounded-[1.6rem] bg-slate-900 shadow-xl">
                <Smartphone size={30} className="text-white" />
                <div className="absolute bottom-2 rounded-full bg-white/14 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white">
                  ABC
                </div>
              </div>

              <div className="absolute bottom-10 right-10 h-28 w-24 rounded-[1.9rem] bg-[#3d8f87] shadow-[0_18px_32px_rgba(61,143,135,0.22)]" />
              <div className="absolute bottom-28 right-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#f4ccb0] shadow-sm">
                <UserRound size={38} strokeWidth={1.8} className="text-[#364152]" />
              </div>

              <div className="absolute left-[8.8rem] top-8 rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MessageCircleMore size={16} className="text-[#5874c9]" />
                  <span>Practice</span>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 right-0 mx-auto h-10 w-48 rounded-full bg-[#d9c4ab]/45 blur-md" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/70 bg-white/40 p-5 sm:p-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAudioClick}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-base font-semibold text-slate-800 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Volume2 size={20} />
              <span className="flex flex-col items-start leading-tight">
                <span>{isSpeaking ? 'Stop audio' : 'Hear directions'}</span>
                <span className="text-[0.72rem] font-medium opacity-75">
                  {isSpeaking ? ROHINGYA_UI.stopAudio : ROHINGYA_UI.hearDirections}
                </span>
              </span>
            </button>
          </div>

          <div className="relative mt-4">
            <button
              type="button"
              onClick={onContinue}
              className="relative flex w-full items-center justify-between rounded-[2rem] bg-[linear-gradient(135deg,#111827,#23313f)] px-7 py-7 text-left text-white shadow-[0_24px_40px_rgba(35,49,63,0.28)] ring-4 ring-white/40 transition-transform hover:-translate-y-0.5 active:scale-[0.99] sm:px-8 sm:py-8"
            >
              <div className="pointer-events-none absolute bottom-3 right-4">
                <MousePointer2
                  size={32}
                  className="animate-bounce rotate-[10deg] text-white drop-shadow-[0_10px_18px_rgba(17,24,39,0.35)]"
                  fill="currentColor"
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                  {ROHINGYA_UI.tapHere}
                </p>
                <p className="mt-2 text-4xl font-semibold sm:text-5xl">Start practice</p>
                <p className="mt-1 text-base font-medium text-white/70">{ROHINGYA_UI.startPractice}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/14">
                <ArrowDown size={28} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
