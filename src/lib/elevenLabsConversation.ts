import { Conversation } from '@11labs/client';
import type { Mode, Status } from '@11labs/client';

export type { Mode, Status };

export interface ConversationMessage {
  role: 'ai' | 'user';
  text: string;
}

export interface ConversationSession {
  endSession: () => Promise<void>;
  setMicMuted: (muted: boolean) => void;
  getInputByteFrequencyData: () => Uint8Array;
  getOutputByteFrequencyData: () => Uint8Array;
}

interface StartOptions {
  agentId: string;
  firstMessage: string;
  onMessage: (msg: ConversationMessage) => void;
  onModeChange: (mode: Mode) => void;
  onStatusChange: (status: Status) => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
}

export async function startConversationSession(
  options: StartOptions,
): Promise<ConversationSession> {
  const session = await Conversation.startSession({
    agentId: options.agentId,
    connectionType: 'webrtc',
    overrides: {
      // Only override the opening line — use the agent's built-in system prompt and voice
      agent: {
        firstMessage: options.firstMessage,
        language: 'en',
      },
    },
    onMessage: ({ message, source }) => {
      options.onMessage({ role: source === 'ai' ? 'ai' : 'user', text: message });
    },
    onModeChange: ({ mode }) => {
      options.onModeChange(mode);
    },
    onStatusChange: ({ status }) => {
      options.onStatusChange(status);
    },
    onDisconnect: () => {
      options.onDisconnect();
    },
    onError: (message) => {
      options.onError(message);
    },
  });

  return session;
}
