import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Loader2, Target } from 'lucide-react';
import type { Mode } from '@11labs/client';
import type { Message, Scenario, Struggle, SupportFeedback } from '../types';
import { detectStruggle, generateSupportFeedback } from '../lib/gemini';
import { startConversationSession } from '../lib/elevenLabsConversation';
import type { ConversationSession } from '../lib/elevenLabsConversation';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;

interface ConversationScreenProps {
  scenario: Scenario;
  categoryColor: string;
  onComplete: (messages: Message[], feedback: SupportFeedback, struggles: Struggle[]) => void;
  onBack: () => void;
}

type Phase = 'connecting' | 'active' | 'analyzing' | 'error';

export function ConversationScreen({
  scenario,
  categoryColor,
  onComplete,
  onBack,
}: ConversationScreenProps) {
  const [phase, setPhase] = useState<Phase>('connecting');
  const [mode, setMode] = useState<Mode>('listening');
  const [messages, setMessages] = useState<Message[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const sessionRef = useRef<ConversationSession | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const userTurnCountRef = useRef(0);
  const analysisRanRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Post-conversation Gemini analysis ─────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (analysisRanRef.current) return;
    analysisRanRef.current = true;
    setPhase('analyzing');

    const transcript = messagesRef.current;
    const userMsgs = transcript.filter((m) => m.role === 'user');
    const aiMsgs = transcript.filter((m) => m.role === 'ai');

    const struggles = await Promise.all(
      userMsgs.map((userMsg, i) => {
        const aiQuestion = aiMsgs[i]?.text ?? scenario.openingLine;
        return detectStruggle(scenario, aiQuestion, userMsg.text, i + 1);
      }),
    );

    const feedback = await generateSupportFeedback(scenario, transcript, struggles);
    onComplete(transcript, feedback, struggles);
  }, [scenario, onComplete]);

  // ── Connect to ElevenLabs agent on mount ──────────────────────────────────
  useEffect(() => {
    if (!AGENT_ID) {
      setErrorMsg('VITE_ELEVENLABS_AGENT_ID is not set.');
      setPhase('error');
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        const session = await startConversationSession({
          agentId: AGENT_ID!,
          firstMessage: scenario.openingLine,
          onMessage: ({ role, text }) => {
            const msg: Message = { role, text };
            setMessages((prev) => {
              const updated = [...prev, msg];
              messagesRef.current = updated;
              return updated;
            });
            if (role === 'user') {
              userTurnCountRef.current += 1;
            }
          },
          onModeChange: (m) => setMode(m),
          onStatusChange: (s) => {
            if (s === 'connected') setPhase('active');
          },
          onDisconnect: () => {
            // Only run analysis if the user actually spoke.
            // This naturally handles React StrictMode's cleanup-unmount
            // (which fires before any user interaction) and any other
            // premature disconnects.
            if (userTurnCountRef.current > 0) {
              void runAnalysis();
            } else if (!cancelled) {
              setErrorMsg('Connection ended before the conversation started. Please try again.');
              setPhase('error');
            }
          },
          onError: (err) => {
            setErrorMsg(err);
            setPhase('error');
          },
        });

        if (cancelled) {
          await session.endSession().catch(() => {});
          return;
        }

        sessionRef.current = session;
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(String(err));
          setPhase('error');
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      sessionRef.current?.endSession().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userTurns = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          disabled={phase === 'analyzing'}
          className="flex items-center gap-1 text-gray-400 mb-3 -ml-1 px-1 py-1 rounded active:bg-gray-100 disabled:opacity-30"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Exit</span>
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: categoryColor }}
          >
            AI
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate"
              style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
              {scenario.title}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              Speaking with {scenario.aiRole}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                phase === 'active' ? 'bg-green-400' : 'bg-gray-300'
              }`}
            />
            <span className="text-xs text-gray-400 capitalize">
              {phase === 'connecting' ? 'connecting' : phase === 'active' ? 'live' : phase}
            </span>
          </div>
        </div>
      </div>

      {/* Goal banner */}
      <div
        className="mx-4 mt-3 px-4 py-2.5 rounded-xl flex items-start gap-2"
        style={{ background: `${categoryColor}12`, border: `1px solid ${categoryColor}25` }}
      >
        <Target size={14} className="mt-0.5 flex-shrink-0" style={{ color: categoryColor }} />
        <p className="text-xs leading-relaxed font-medium" style={{ color: categoryColor }}>
          {scenario.goal}
        </p>
      </div>

      {/* Turn progress */}
      {phase === 'active' && (
        <div className="px-4 pt-2.5">
          <div className="flex gap-1.5">
            {Array.from({ length: scenario.maxTurns }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i < userTurns ? categoryColor : '#e5e7eb' }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">
            {userTurns} / {scenario.maxTurns} turns
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'ai'
                  ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                  : 'text-white rounded-tr-sm shadow-sm'
              }`}
              style={msg.role === 'user' ? { background: categoryColor } : undefined}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom panel */}
      <div className="bg-white border-t border-gray-100 px-6 py-6 flex flex-col items-center gap-4">

        {phase === 'error' && (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {phase === 'connecting' && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin" style={{ color: categoryColor }} />
            <p className="text-sm text-gray-500">Connecting...</p>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin" style={{ color: categoryColor }} />
            <p className="text-sm text-gray-500">Preparing your practice...</p>
          </div>
        )}

        {phase === 'active' && (
          <VoiceOrb mode={mode} color={categoryColor} />
        )}
      </div>
    </div>
  );
}

// ── Voice orb ──────────────────────────────────────────────────────────────────

function VoiceOrb({ mode, color }: { mode: Mode; color: string }) {
  const isSpeaking = mode === 'speaking';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: 80 + i * 22,
              height: 80 + i * 22,
              background: `${color}${isSpeaking
                ? Math.max(8, 18 - i * 5).toString(16).padStart(2, '0')
                : '08'}`,
              animation: isSpeaking
                ? `ping ${0.8 + i * 0.2}s cubic-bezier(0,0,0.2,1) infinite`
                : `pulse ${2 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
        <div
          className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
        >
          <div className="flex gap-1 items-center h-8">
            {[1, 1.5, 1, 1.8, 1, 1.4, 1].map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-white"
                style={{
                  height: isSpeaking ? `${h * 14}px` : '6px',
                  transition: 'height 0.15s ease',
                  animation: isSpeaking
                    ? `bounce ${0.5 + i * 0.07}s ease-in-out infinite alternate`
                    : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500">
        {isSpeaking ? 'AI is speaking...' : 'Listening — speak now'}
      </p>
    </div>
  );
}
