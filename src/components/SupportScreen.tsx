import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Home,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Turtle,
  Volume2,
} from 'lucide-react';
import type { PronunciationFeedback } from '../lib/gemini';
import { getPronunciationFeedback } from '../lib/gemini';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import type { Scenario, Struggle, SupportFeedback } from '../types';
import { ROHINGYA_UI } from '../lib/rohingya';

interface SupportScreenProps {
  scenario: Scenario;
  feedback: SupportFeedback;
  struggles: Struggle[];
  categoryColor: string;
  onRetryScenario: () => void;
  onGoHome: () => void;
  onStartLesson?: () => void;
}

type PracticePhase = 'ready' | 'record' | 'analyzing' | 'result' | 'complete';

interface PracticeStep {
  id: string;
  label: string;
  text: string;
}

const SCORE_STYLES = {
  great: { color: '#16a34a', emoji: '🌟' },
  good: { color: '#854d0e', emoji: '👍' },
  try_again: { color: '#dc2626', emoji: '💪' },
} as const;

export function SupportScreen({
  scenario,
  feedback,
  struggles,
  categoryColor: _categoryColor,
  onRetryScenario,
  onGoHome,
  onStartLesson: _onStartLesson,
}: SupportScreenProps) {
  const warmSurface = 'linear-gradient(160deg, rgba(255, 252, 247, 0.96) 0%, rgba(243, 236, 227, 0.92) 100%)';
  const primarySurface = 'linear-gradient(135deg, #33424d, #5a6772)';
  const { speak, speakSlow, isSpeaking } = useTextToSpeech();
  const {
    isListening,
    transcript,
    transcriptRef,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const struggleTerms = useMemo(
    () =>
      [...new Set(
        struggles
          .flatMap((struggle) => struggle.missingWords)
          .map((term) => term.trim())
          .filter(Boolean),
      )],
    [struggles],
  );

  const practiceSteps = useMemo<PracticeStep[]>(() => {
    const focusSteps = struggleTerms.slice(0, 2).map((term, index) => ({
      id: `focus-${index}`,
      label: term.includes(' ') ? 'Focus phrase' : 'Focus word',
      text: term,
    }));

    const fallbackSteps: PracticeStep[] = [
      { id: 'word', label: 'Word', text: feedback.practice_word },
      { id: 'phrase', label: 'Phrase', text: feedback.practice_phrase },
      { id: 'sentence', label: 'Full sentence', text: feedback.practice_sentence },
    ];

    return [...focusSteps, ...fallbackSteps]
      .filter((step, index, steps) => steps.findIndex((candidate) => candidate.text === step.text) === index)
      .slice(0, 3);
  }, [feedback.practice_phrase, feedback.practice_sentence, feedback.practice_word, struggleTerms]);

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('ready');
  const [spokenText, setSpokenText] = useState('');
  const [feedbackResult, setFeedbackResult] = useState<PronunciationFeedback | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  const currentStep = practiceSteps[stepIndex];
  const stepProgress = practiceSteps.length > 0 ? ((stepIndex + 1) / practiceSteps.length) * 100 : 0;
  const scoreStyle = feedbackResult ? SCORE_STYLES[feedbackResult.score] : null;

  useEffect(() => {
    if (phase !== 'record' || isListening) return;

    const spoken = transcriptRef.current.trim();
    if (!spoken || !currentStep) {
      setPhase('ready');
      return;
    }

    setSpokenText(spoken);
    setPhase('analyzing');
    resetTranscript();

    getPronunciationFeedback(currentStep.text, spoken)
      .then((result) => {
        setFeedbackResult(result);
        if (result.score !== 'try_again') {
          setCompletedCount((count) => Math.max(count, stepIndex + 1));
        }
        setPhase('result');
      })
      .catch(() => {
        setFeedbackResult({
          score: 'good',
          message: 'Good try! Keep practicing.',
          word_tips: 'Listen again and try once more.',
        });
        setPhase('result');
      });
  }, [currentStep, isListening, phase, resetTranscript, stepIndex, transcriptRef]);

  const handleListen = async (slow = false) => {
    if (!currentStep) return;
    await (slow ? speakSlow(currentStep.text) : speak(currentStep.text));
  };

  const handleStartRecording = () => {
    setFeedbackResult(null);
    setSpokenText('');
    resetTranscript();
    setPhase('record');
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
  };

  const handleTryAgain = () => {
    setFeedbackResult(null);
    setSpokenText('');
    resetTranscript();
    setPhase('ready');
  };

  const handleNext = () => {
    setFeedbackResult(null);
    setSpokenText('');
    resetTranscript();

    if (stepIndex < practiceSteps.length - 1) {
      setStepIndex((index) => index + 1);
      setPhase('ready');
      return;
    }

    setPhase('complete');
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
              {struggleTerms.length > 0 && (
                <SupportCard title="Words to work on" emoji="🧩">
                  <div className="flex flex-wrap gap-2">
                    {struggleTerms.slice(0, 6).map((term) => (
                      <span
                        key={term}
                        className="rounded-full px-3 py-2 text-sm font-semibold"
                        style={{
                          background: 'rgba(180, 123, 103, 0.12)',
                          color: '#b47b67',
                        }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </SupportCard>
              )}

              <SupportCard title="Say it step by step" emoji="🎯">
                {practiceSteps.length === 0 ? (
                  <p>No practice words available yet.</p>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="h-2 overflow-hidden rounded-full bg-[rgba(180,123,103,0.12)]"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${stepProgress}%`,
                          background: 'linear-gradient(90deg, #b47b67, #d8b79a)',
                        }}
                      />
                    </div>

                    <div className="rounded-[1.2rem] border border-white/80 bg-white/82 p-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Step {Math.min(stepIndex + 1, practiceSteps.length)} of {practiceSteps.length}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-500">{currentStep?.label}</p>
                      <p className="mt-2 text-xl font-semibold leading-snug text-slate-900">{currentStep?.text}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {phase === 'complete'
                          ? 'You finished all practice steps.'
                          : 'Listen, then tap the mic and say this out loud.'}
                      </p>
                    </div>

                    {speechError && (
                      <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {speechError}
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        className="btn btn-secondary"
                        onClick={() => void handleListen(false)}
                        disabled={!currentStep || isSpeaking || isListening || phase === 'analyzing' || phase === 'complete'}
                      >
                        <Volume2 size={18} />
                        <span>Hear it</span>
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => void handleListen(true)}
                        disabled={!currentStep || isSpeaking || isListening || phase === 'analyzing' || phase === 'complete'}
                      >
                        <Turtle size={18} />
                        <span>Slow</span>
                      </button>

                      <button
                        className="btn text-white"
                        onClick={isListening ? handleStopRecording : handleStartRecording}
                        disabled={!isSupported || isSpeaking || phase === 'analyzing' || phase === 'complete'}
                        style={
                          isListening
                            ? ({ background: 'linear-gradient(135deg, #d46b4d, #b9472d)' } as CSSProperties)
                            : ({ background: primarySurface } as CSSProperties)
                        }
                      >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        <span>{isListening ? 'Stop mic' : 'Try saying it'}</span>
                      </button>
                    </div>

                    <div className="rounded-[1.2rem] border border-white/80 bg-white/82 px-4 py-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Mic status
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {!isSupported
                          ? 'This browser does not support speech recognition.'
                          : isListening
                          ? 'Listening now. Tap "Stop mic" when you finish speaking.'
                          : phase === 'analyzing'
                          ? 'Checking your pronunciation now.'
                          : 'Tap "Try saying it" to start.'}
                      </p>
                      {(transcript || spokenText) && (
                        <>
                          <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            You said
                          </p>
                          <p className="mt-1 text-sm text-slate-700">{transcript || spokenText}</p>
                        </>
                      )}
                    </div>

                    {phase === 'analyzing' && (
                      <div className="rounded-[1.2rem] border border-white/80 bg-white/82 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Loader2 size={18} className="animate-spin" style={{ color: '#b47b67' }} />
                          <p className="text-sm font-semibold text-slate-800">Checking your pronunciation</p>
                        </div>
                      </div>
                    )}

                    {phase === 'result' && feedbackResult && scoreStyle && (
                      <div className="rounded-[1.2rem] border border-white/80 bg-white/82 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} style={{ color: scoreStyle.color }} />
                          <p className="text-sm font-semibold" style={{ color: scoreStyle.color }}>
                            {scoreStyle.emoji} {feedbackResult.message}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">{feedbackResult.word_tips}</p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <button className="btn btn-secondary" onClick={handleTryAgain}>
                            <RotateCcw size={18} />
                            <span>Try again</span>
                          </button>
                          <button className="btn text-white" onClick={handleNext} style={{ background: primarySurface }}>
                            <span>{stepIndex < practiceSteps.length - 1 ? 'Next step' : 'Finish practice'}</span>
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    )}

                    {phase === 'complete' && (
                      <div className="rounded-[1.2rem] border border-white/80 bg-white/82 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          You finished {completedCount} of {practiceSteps.length} practice steps.
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          You can retry the conversation or go home to choose a new topic.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </SupportCard>
            </div>

            <div className="complete-actions mt-8">
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
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl leading-none">{emoji}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
