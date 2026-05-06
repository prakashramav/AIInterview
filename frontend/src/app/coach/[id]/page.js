'use client';
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { AlertCircle, CheckCircle2, MessageSquare, Sparkles, Mic, Square } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import AvatarPlayer from '@/components/AvatarPlayer';
import useMediaStream from '@/hooks/useMediaStream';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useAvatar from '@/hooks/useAvatar';

export default function CoachSession({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [lastCorrection, setLastCorrection] = useState(null);

  const { stream, videoRef, error: mediaError } = useMediaStream();
  const { isRecording, startRecording, stopRecording, transcript, setTranscript } = useSpeechRecognition();
  const { videoUrl, isGenerating, generateVideo } = useAvatar();

  // Inactivity & Nudge Timers
  const inactivityTimerRef = useRef(null);
  const nudgeTimersRef = useRef([]);

  const resetInactivityTimer = () => {
    // Clear all existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    nudgeTimersRef.current.forEach(timer => clearTimeout(timer));
    nudgeTimersRef.current = [];

    // Nudge 1: After 2 minutes
    nudgeTimersRef.current.push(setTimeout(() => {
      if (!isRecording && !processing) {
        const nudge = "I didn't hear anything... are you still with me? Let's keep practicing our English!";
        speakText(nudge);
      }
    }, 120000));

    // Nudge 2: After 4 minutes
    nudgeTimersRef.current.push(setTimeout(() => {
      if (!isRecording && !processing) {
        const nudge = "I'm still here waiting for you. Don't worry about mistakes, just try to say something in English!";
        speakText(nudge);
      }
    }, 240000));

    // Final Timeout: After 5 minutes
    inactivityTimerRef.current = setTimeout(() => {
      alert("Session ended due to 5 minutes of inactivity.");
      handleExit(true); // Force exit
    }, 300000); 
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/english/coach/${id}`);
        setSession(res.data);
        // Speak the first message
        if (res.data.messages.length === 1) {
          const firstMsg = res.data.messages[0].content;
          setTimeout(() => {
            speakText(firstMsg);
            generateVideo(firstMsg);
            resetInactivityTimer();
          }, 1500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        resetInactivityTimer();
      }
    };
    fetchSession();

    return () => {
      window.speechSynthesis.cancel();
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      stopMediaTracks();
    };
  }, [id]);

  const stopMediaTracks = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleExit = (force = false) => {
    if (!force && !confirm('Are you sure you want to exit the session?')) return;
    
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    nudgeTimersRef.current.forEach(timer => clearTimeout(timer));
    nudgeTimersRef.current = [];

    stopMediaTracks();
    window.speechSynthesis.cancel();
    router.push('/dashboard');
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Female Indian voices
    const indianVoice = voices.find(v => (v.lang.includes('en-IN') || v.name.includes('India')) && (v.name.includes('Female') || v.name.includes('Heera') || v.name.includes('Neerja'))) 
                    || voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
    if (indianVoice) utterance.voice = indianVoice;
    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmitMessage = async () => {
    const text = stopRecording();
    if (!text.trim()) return;

    setProcessing(true);
    setTranscript(text);
    setLastCorrection(null);

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/english/coach/message-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId: id, message: text })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.analysis) setLastCorrection(data.analysis);
            if (data.chunk) fullContent += data.chunk;
            if (data.done) {
              speakText(fullContent);
              generateVideo(fullContent);
              setSession(prev => ({ ...prev, messages: data.messages }));
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
      resetInactivityTimer();
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading Coach...</div>;

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl mb-4">
        <div>
          <h2 className="font-bold text-xl flex items-center gap-2">
            <Sparkles className="text-primary animate-pulse" size={20} />
            English Communication Coach
          </h2>
          <p className="text-sm text-foreground/60">Level: {session?.level}</p>
        </div>
        <button onClick={() => handleExit()} className="text-sm font-medium hover:text-primary transition-colors">Exit Session</button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <VideoPlayer videoRef={videoRef} error={mediaError} />
        <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
             {session?.messages?.map((msg, i) => (
               <div key={i} className={`max-w-[85%] p-3 rounded-2xl ${
                 msg.role === 'ai' ? 'bg-primary/10 self-start text-sm' : 'bg-foreground/5 self-end text-sm border border-border/50'
               }`}>
                 {msg.role === 'ai' ? (
                    <div className="space-y-2">
                       {msg.content.split('\n').map((line, j) => (
                         <p key={j} className={
                           line.includes('Correction:') ? 'font-bold text-primary' : 
                           line.includes('Better Version:') ? 'italic text-foreground/80' : ''
                         }>{line}</p>
                       ))}
                    </div>
                 ) : msg.content}
               </div>
             ))}
          </div>
          <AvatarPlayer videoUrl={videoUrl} isGenerating={isGenerating} isFallbackSpeaking={isAISpeaking} />
        </div>
      </div>

      {/* Real-time Feedback Section */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background/50 border border-border rounded-2xl p-4 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-foreground/40 mb-1 uppercase tracking-wider">Live Transcript</p>
          <p className="text-sm italic line-clamp-2">{transcript || "Listening..."}</p>
        </div>
        
        <div className="md:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden">
          {lastCorrection ? (
            <div className="flex items-start gap-3">
                {lastCorrection.isCorrect ? (
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                ) : (
                  <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Teacher Correction</p>
                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Score: {lastCorrection.fluencyScore}/10
                    </span>
                  </div>
                  <p className="text-sm font-medium">{lastCorrection.isCorrect ? "Perfectly said!" : lastCorrection.corrected}</p>
                  {lastCorrection.explanation && <p className="text-[10px] text-foreground/60 mt-1 italic">"{lastCorrection.explanation}"</p>}
                </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-foreground/40 text-sm">
              <Sparkles size={16} className="animate-pulse" />
              <span>Teacher is listening for your pronunciation...</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-center pb-4">
        <button
          onClick={isRecording ? handleSubmitMessage : startRecording}
          disabled={processing || isAISpeaking}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50 ${
            isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white'
          }`}
        >
          {processing ? (
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : isRecording ? (
            <Square size={32} fill="currentColor" />
          ) : (
            <Mic size={32} />
          )}
        </button>
      </div>
    </div>
  );
}
