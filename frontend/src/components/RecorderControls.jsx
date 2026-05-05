import { Mic, Square, Loader2 } from 'lucide-react';

export default function RecorderControls({ isRecording, onStart, onStop, isProcessing }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {isProcessing ? (
        <button 
          disabled
          className="flex items-center gap-2 bg-foreground/10 text-foreground/50 px-8 py-4 rounded-full font-bold shadow-lg"
        >
          <Loader2 className="animate-spin" size={24} />
          Processing Answer...
        </button>
      ) : isRecording ? (
        <button 
          onClick={onStop}
          className="group flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 hover:scale-105 active:scale-95"
        >
          <Square size={20} className="fill-current" />
          Stop & Submit Answer
        </button>
      ) : (
        <button 
          onClick={onStart}
          className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
        >
          <Mic size={24} />
          Start Answering
        </button>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-medium animate-pulse mt-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          Recording your answer...
        </div>
      )}
    </div>
  );
}
