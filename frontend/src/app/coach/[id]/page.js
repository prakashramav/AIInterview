'use client';
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { 
  Send, 
  Loader2, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Sparkles,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoachSession({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  // State
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastErrors, setLastErrors] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // 12-step map for descriptions
  const stepMap = {
    1: "Introduction",
    2: "Explanation",
    3: "Examples",
    4: "Guided Practice",
    5: "Feedback",
    6: "Free Practice",
    7: "Grammar Focus",
    8: "Pronunciation Tip",
    9: "Roleplay",
    10: "Evaluation",
    11: "Summary",
    12: "Preview"
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/english/coach/${id}`);
        setSession(res.data);
        setMessages(res.data.messages);
        setLastErrors(res.data.recentErrors.slice(-3));
        
        if (res.data.status === 'completed') {
          setShowCelebration(true);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();

    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-IN';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputText(currentTranscript);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          // Auto-submit would go here if desired, but we'll let user review for now or handle in separate function
        };

        recognitionRef.current.onerror = (e) => {
          console.error('STT Error:', e.error);
          setIsRecording(false);
        };
      }
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const speakText = (text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.lang = 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
    if (indianVoice) utterance.voice = indianVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    // Human-like delay start
    const startTime = Date.now();
    setIsTyping(true);

    try {
      const res = await api.post('/english/coach/message', { sessionId: id, message: userMsg });
      
      const { response, currentStep, currentDay, errors, lessonCompleted } = res.data;
      
      // Minimum 1200ms delay for human feel
      const elapsedTime = Date.now() - startTime;
      const waitTime = Math.max(1200, 800 + (response.length * 10)); // Variable typing speed
      if (elapsedTime < waitTime) {
        await new Promise(resolve => setTimeout(resolve, waitTime - elapsedTime));
      }

      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      
      if (session.currentStep !== currentStep) {
        // Show step transition toast? handled by sidebar update
      }

      setSession(prev => ({ ...prev, currentStep, currentDay }));
      setLastErrors(errors);
      
      speakText(response);

      if (lessonCompleted) {
        setShowCelebration(true);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setIsTyping(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-foreground/40 font-bold animate-pulse tracking-widest uppercase text-xs">Waiting for Priya...</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-background">
      
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl p-6"
          >
            <div className="text-center max-w-lg">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} className="text-primary" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-4">Day {session.currentDay - 1} Complete!</h2>
              <p className="text-foreground/60 text-lg mb-8 font-medium">Excellent progress today. Priya is very impressed with your dedication.</p>
              <button 
                onClick={() => router.push('/coach/lessons')}
                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Continue to Library
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Panel (70%) */}
      <div className="flex-1 flex flex-col h-full border-r border-border p-4 md:p-6">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between mb-4 bg-card p-3 rounded-xl border border-border">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs">P</div>
             <div>
               <h3 className="font-bold text-sm">Priya Sharma</h3>
               <p className="text-[10px] text-primary font-black uppercase">Step {session.currentStep}/12</p>
             </div>
          </div>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-2 space-y-6 mb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center font-black text-sm border shadow-sm ${
                    msg.role === 'ai' ? 'bg-primary text-primary-foreground border-primary/20' : 'bg-secondary text-foreground border-border'
                  }`}>
                    {msg.role === 'ai' ? 'P' : session.userName[0]}
                  </div>
                  <div className={`px-5 py-4 rounded-3xl text-sm md:text-base font-medium leading-relaxed shadow-sm ${
                    msg.role === 'ai' 
                      ? 'bg-card text-foreground rounded-tl-none border border-border' 
                      : 'bg-primary text-primary-foreground rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-black text-sm text-primary-foreground shadow-sm">P</div>
                  <div className="bg-card px-6 py-4 rounded-3xl rounded-tl-none border border-border flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <footer className="relative mt-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => window.speechSynthesis.cancel()}
                disabled={isProcessing}
                placeholder={isRecording ? "Listening..." : "Message Priya... (Shift+Enter for newline)"}
                className="w-full bg-card border-2 border-border rounded-[24px] px-6 py-4 pr-14 text-base focus:outline-none focus:border-primary transition-all resize-none shadow-xl min-h-[60px] max-h-32"
              />
              <button
                type="button"
                onClick={toggleRecording}
                className={`absolute right-4 bottom-4 p-2 rounded-xl transition-all ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-foreground/40 hover:text-primary'
                }`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
            </button>
          </form>
        </footer>
      </div>

      {/* Sidebar Progress Panel (30%) */}
      <aside className="hidden md:flex flex-col w-[320px] bg-card p-6 border-l border-border h-full">
        <div className="flex items-center justify-between mb-8">
           <button onClick={() => router.back()} className="text-foreground/40 hover:text-primary transition-colors">
              <ArrowLeft size={24} />
           </button>
           <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-xl border transition-all ${isMuted ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'}`}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
           </button>
        </div>

        <div className="space-y-8">
          {/* Progress Overview */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-4">Course Progress</p>
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-2xl">Day {session.currentDay}</span>
              <span className="text-xs font-bold text-foreground/40">of 60</span>
            </div>
            <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
               <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${(session.currentDay / 60) * 100}%` }} 
               />
            </div>
          </div>

          {/* Step Progress */}
          <div className="bg-background/50 border border-border rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Target size={20} className="text-primary" />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.1em] text-foreground/30">Current Step</p>
                 <h4 className="font-bold text-sm">{stepMap[session.currentStep] || "Lesson"}</h4>
               </div>
            </div>
            
            <div className="space-y-3">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => (
                 <div key={s} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s < session.currentStep ? 'bg-green-500' : s === session.currentStep ? 'bg-primary animate-pulse' : 'bg-foreground/10'}`} />
                    <span className={`text-[10px] font-bold ${s <= session.currentStep ? 'text-foreground' : 'text-foreground/20'}`}>
                       Step {s}: {stepMap[s]}
                    </span>
                    {s < session.currentStep && <CheckCircle2 size={12} className="text-green-500 ml-auto" />}
                 </div>
               ))}
            </div>
          </div>

          {/* Last 3 Errors */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-4 flex items-center gap-2">
               <AlertCircle size={12} /> Focus Areas
            </p>
            <div className="space-y-2">
              {lastErrors.length > 0 ? lastErrors.map((err, i) => (
                <div key={i} className="bg-red-500/5 border border-red-500/10 p-3 rounded-2xl text-xs font-medium text-red-600/80 flex items-start gap-2">
                   <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                   {err}
                </div>
              )) : (
                <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl text-xs font-medium text-green-600/80 flex items-center gap-2">
                   <CheckCircle2 size={16} /> No errors detected yet!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-border">
           <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                 <BookOpen size={16} className="text-primary" />
              </div>
              <p className="text-xs font-bold text-foreground/60">{session.lessonTopic}</p>
           </div>
        </div>
      </aside>

      <style jsx global>{`
        @keyframes wordFadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .word-anim {
          display: inline-block;
          animation: wordFadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
