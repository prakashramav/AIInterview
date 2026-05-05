import { Bot, Mic } from 'lucide-react';

export default function InterviewPanel({ isAISpeaking }) {
  return (
    <div className="relative w-full h-full bg-card rounded-2xl overflow-hidden border border-border shadow-xl flex flex-col items-center justify-center">
      
      {/* AI Avatar */}
      <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isAISpeaking ? 'bg-primary/20 scale-105' : 'bg-foreground/5'}`}>
        
        {/* Animated Rings when speaking */}
        {isAISpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-[-20px] rounded-full border border-primary/30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
          </>
        )}
        
        <Bot size={64} className={`transition-colors duration-300 ${isAISpeaking ? 'text-primary' : 'text-foreground/40'}`} />
      </div>

      <div className="mt-8 text-center z-10">
        <h3 className="text-2xl font-bold mb-2">AI Interviewer</h3>
        <div className="flex items-center gap-2 justify-center text-foreground/60">
          <Mic size={16} className={isAISpeaking ? 'text-primary animate-pulse' : ''} />
          <span className="text-sm font-medium">
            {isAISpeaking ? 'Speaking...' : 'Listening...'}
          </span>
        </div>
      </div>

      {/* AI Name Badge */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm font-medium">
        Interviewer (AI)
      </div>
    </div>
  );
}
