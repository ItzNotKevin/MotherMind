import { Mic, MicOff, Square } from 'lucide-react';

interface MicButtonProps {
  isListening: boolean;
  isSupported: boolean;
  disabled?: boolean;
  size?: 'sm' | 'lg';
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({
  isListening,
  isSupported,
  disabled = false,
  size = 'lg',
  onStart,
  onStop,
}: MicButtonProps) {
  const btnSize = size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
  const iconSize = size === 'lg' ? 32 : 22;

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`${btnSize} rounded-full bg-gray-200 flex items-center justify-center`}>
          <MicOff size={iconSize} className="text-gray-400" />
        </div>
        <p className="text-xs text-gray-400 text-center px-4">
          Voice not available — please type below
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={isListening ? onStop : onStart}
        disabled={disabled}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
        className={`relative ${btnSize} rounded-full flex items-center justify-center transition-all duration-200 shadow-lg focus:outline-none ${
          isListening
            ? 'bg-red-500 scale-110'
            : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105 active:scale-95'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
        )}
        {isListening ? (
          <Square size={iconSize - 4} className="text-white fill-white relative z-10" />
        ) : (
          <Mic size={iconSize} className="text-white relative z-10" />
        )}
      </button>
      <span className="text-sm font-medium text-gray-500">
        {isListening ? 'Tap to stop' : 'Tap to speak'}
      </span>
    </div>
  );
}
