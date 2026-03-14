import { useState } from 'react';
import { Volume2, RotateCcw, Home, Mic } from 'lucide-react';
import type { Scenario, SupportFeedback } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { ROHINGYA_UI } from '../lib/rohingya';

interface SupportScreenProps {
  scenario: Scenario;
  feedback: SupportFeedback;
  categoryColor: string;
  onRetryScenario: () => void;
  onGoHome: () => void;
  onStartLesson?: () => void;
}

export function SupportScreen({
  scenario,
  feedback,
  categoryColor: _categoryColor,
  onRetryScenario,
  onGoHome,
  onStartLesson,
}: SupportScreenProps) {
  const warmSurface = 'linear-gradient(160deg, rgba(255, 252, 247, 0.96) 0%, rgba(243, 236, 227, 0.92) 100%)';
  const primarySurface = 'linear-gradient(135deg, #33424d, #5a6772)';
  const { speak, speakSlow } = useTextToSpeech();
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const handleSpeak = async (text: string, id: string, slow = false) => {
    setSpeakingId(id);
    try {
      if (slow) {
        await speakSlow(text);
      } else {
        await speak(text);
      }
    } finally {
      setSpeakingId(null);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="app-container">
        <header className="app-header">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true" />
            <div>
              <p className="brand-kicker">Voice practice for newcomer moms</p>
              <h1>MotherMind</h1>
            </div>
          </div>

          <button className="btn btn-secondary btn-icon" onClick={onGoHome} title="Return home">
            <Home size={18} />
            <span className="flex flex-col items-start leading-tight">
              <span>Home</span>
              <span className="text-[0.72rem] font-medium opacity-75">{ROHINGYA_UI.home}</span>
            </span>
          </button>
        </header>
        <main className="main-content">
          <section className="complete-view animate-fade-in glass-panel" style={{ background: warmSurface }}>
            <div
              className="trophy-ring"
              style={{
                background: 'rgba(180, 123, 103, 0.12)',
                border: '2px solid rgba(180, 123, 103, 0.2)',
              }}
            >
              <span className="text-5xl" aria-hidden="true">
                🌟
              </span>
            </div>

            <h2 className="complete-title">Practice support</h2>
            <p className="complete-subtitle">
              Review your conversation in <strong style={{ color: '#b47b67' }}>{scenario.title}</strong>.
            </p>

            <div
              className="mx-auto mt-5 max-w-xl rounded-[1.5rem] px-4 py-4"
              style={{ background: 'rgba(255,251,247,0.88)', border: '1px solid rgba(180, 123, 103, 0.16)' }}
            >
              <p className="text-base font-medium leading-snug" style={{ color: '#b47b67' }}>
                {feedback.encouragement}
              </p>
            </div>

            <div className="mt-6 grid gap-4 text-left">
              <SupportCard title="Say it better" emoji="💬">
                <p>{feedback.say_it_better}</p>
                <AudioRow
                  text={feedback.say_it_better}
                  id="say"
                  speakingId={speakingId}
                  onSpeak={handleSpeak}
                />
              </SupportCard>

              <SupportCard title="Understand it better" emoji="💡">
                <p>{feedback.understand_it_better}</p>
              </SupportCard>

              <SupportCard title="Practice these" emoji="🎯">
                <div className="space-y-3">
                  <PracticeItem
                    label="Word"
                    text={feedback.practice_word}
                    id="word"
                    speakingId={speakingId}
                    onSpeak={handleSpeak}
                  />
                  <PracticeItem
                    label="Phrase"
                    text={feedback.practice_phrase}
                    id="phrase"
                    speakingId={speakingId}
                    onSpeak={handleSpeak}
                  />
                  <PracticeItem
                    label="Full sentence"
                    text={feedback.practice_sentence}
                    id="sentence"
                    speakingId={speakingId}
                    onSpeak={handleSpeak}
                  />
                </div>
              </SupportCard>
            </div>

            <div className="complete-actions mt-8">
              {onStartLesson && (
                <button className="btn text-white" onClick={onStartLesson} style={{ background: primarySurface }}>
                  <Mic size={18} />
                  <span className="flex flex-col items-start leading-tight">
                    <span>Practice pronunciation</span>
                    <span className="text-[0.72rem] font-medium opacity-80">{ROHINGYA_UI.startPractice}</span>
                  </span>
                </button>
              )}

              <button className="btn text-white" onClick={onRetryScenario} style={{ background: primarySurface }}>
                <RotateCcw size={18} />
                <span className="flex flex-col items-start leading-tight">
                  <span>Try this again</span>
                  <span className="text-[0.72rem] font-medium opacity-80">{ROHINGYA_UI.practiceAgain}</span>
                </span>
              </button>

              <button className="btn btn-secondary" onClick={onGoHome}>
                <Home size={18} />
                <span className="flex flex-col items-start leading-tight">
                  <span>Choose another topic</span>
                  <span className="text-[0.72rem] font-medium opacity-75">{ROHINGYA_UI.backHome}</span>
                </span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SupportCard({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="support-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl leading-none">{emoji}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function AudioRow({
  text,
  id,
  speakingId,
  onSpeak,
}: {
  text: string;
  id: string;
  speakingId: string | null;
  onSpeak: (text: string, id: string, slow?: boolean) => void;
}) {
  const slowId = `${id}-slow`;
  const busy = speakingId !== null && speakingId !== id && speakingId !== slowId;

  return (
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => onSpeak(text, id)}
        disabled={busy}
        className="btn btn-secondary"
        style={{ color: '#b47b67', borderColor: 'rgba(180, 123, 103, 0.16)', background: 'rgba(255,251,247,0.88)' }}
      >
        <Volume2 size={14} />
        Listen
      </button>
      <button
        onClick={() => onSpeak(text, slowId, true)}
        disabled={busy}
        className="btn btn-secondary"
      >
        🐢 Slow
      </button>
    </div>
  );
}

function PracticeItem({
  label,
  text,
  id,
  speakingId,
  onSpeak,
}: {
  label: string;
  text: string;
  id: string;
  speakingId: string | null;
  onSpeak: (text: string, id: string, slow?: boolean) => void;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/80 bg-white/82 p-3 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">
          {label}
        </span>
        <p className="text-slate-800 font-semibold mt-0.5 leading-snug">{text}</p>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={() => onSpeak(text, id)}
          disabled={speakingId !== null && speakingId !== id}
          className="p-2 rounded-lg disabled:opacity-30 transition-colors active:scale-95"
          style={{ color: '#b47b67' }}
          aria-label="Listen"
        >
          <Volume2 size={18} />
        </button>
        <button
          onClick={() => onSpeak(text, `${id}-slow`, true)}
          disabled={speakingId !== null && speakingId !== `${id}-slow`}
          className="text-[10px] text-gray-400 font-medium px-1 disabled:opacity-30"
          aria-label="Listen slowly"
        >
          🐢
        </button>
      </div>
    </div>
  );
}
