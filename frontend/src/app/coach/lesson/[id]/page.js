'use client';
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Sparkles, Mic, Square, Play, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

export default function LessonDetail({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastCorrection, setLastCorrection] = useState(null);

  const { isRecording, startRecording, stopRecording, transcript, setTranscript } = useSpeechRecognition();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/english/lessons`);
        const found = res.data.find(l => l._id === id);
        setLesson(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  useEffect(() => {
    if (lesson && !loading) {
      // Auto-play teacher intro
      const timer = setTimeout(() => {
        speakText(lesson.voiceIntro || lesson.explanation);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lesson, loading]);

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Female Indian voices
    const indianVoice = voices.find(v => (v.lang.includes('en-IN') || v.name.includes('India')) && (v.name.includes('Female') || v.name.includes('Heera') || v.name.includes('Neerja'))) 
                    || voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
    if (indianVoice) utterance.voice = indianVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handlePracticeAnswer = async () => {
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
        body: JSON.stringify({ 
          message: text,
          context: `Lesson Topic: ${lesson.topic}, Lesson Title: ${lesson.title}. Current Task: ${lesson.speakingTasks?.[0] || lesson.practice?.[0]}`
        })
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
              
              const progressRes = await api.post('/english/lessons/progress', {
                lessonId: lesson._id,
                score: data.analysis?.fluencyScore || 0,
                completed: true,
                practiced: true
              });

              // Update dashboard progress and streak
              await api.patch('/progress', {
                currentDay: lesson.day + 1,
                lesson: {
                  lessonId: lesson._id,
                  title: lesson.title,
                  fluencyScore: data.analysis?.fluencyScore || 0
                }
              });

              if (progressRes.data.thresholdMet) {
                alert("🎉 Great job! You've mastered this concept. Let's move to the next lesson!");
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Entering AI Classroom...</div>;
  if (!lesson) return <div className="flex-1 flex items-center justify-center">Lesson not found</div>;

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">
             {lesson.day}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                {lesson.level} • {lesson.topic}
              </span>
            </div>
            <h1 className="text-2xl font-black flex items-center gap-2 mt-0.5">
               {lesson.title}
            </h1>
          </div>
        </div>
        <button onClick={() => router.push('/coach/lessons')} className="bg-secondary/50 hover:bg-secondary text-sm font-bold px-4 py-2 rounded-xl transition-all">
          Exit Classroom
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        {/* Left Column: Teacher Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          {/* AI Teacher Visual */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden aspect-video shadow-lg relative flex items-center justify-center bg-primary/5 group">
             <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                   <Sparkles size={40} className="animate-bounce" />
                </div>
             </div>
             <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">AI Master Teacher</span>
             </div>
          </div>

          {/* Teacher Explanation */}
          <div className="flex-1 bg-card border border-border rounded-3xl p-6 shadow-sm overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Sparkles size={16} />
               </div>
               <h3 className="font-bold text-sm uppercase tracking-widest text-foreground/60">Teacher's Note</h3>
            </div>
            <p className="text-foreground/80 leading-relaxed font-medium italic mb-6">
               "{lesson.explanation}"
            </p>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-foreground/40 uppercase mb-2">Practice Examples</p>
              {lesson.examples.map((ex, i) => (
                <div key={i} className="bg-foreground/5 p-3 rounded-2xl border border-border/50 flex items-center justify-between group">
                  <p className="text-sm italic font-medium">"{ex}"</p>
                  <button onClick={() => speakText(ex)} className="p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <RefreshCcw size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Interaction Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex-1 bg-card border border-border rounded-[2.5rem] p-10 flex flex-col shadow-xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative flex-1 flex flex-col">
              <div className="mb-10">
                <h3 className="text-2xl font-black mb-4">Speaking Practice</h3>
                <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl">
                  <p className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Today's Goal</p>
                  <p className="text-xl font-medium text-foreground/80 italic leading-snug">
                    "{lesson.speakingTasks?.[0] || lesson.practice?.[0]}"
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="mb-8 relative">
                   <div className={`absolute inset-0 bg-primary/20 rounded-full blur-2xl transition-all duration-500 ${isRecording ? 'scale-150' : 'scale-0'}`} />
                   <button
                    onClick={isRecording ? handlePracticeAnswer : startRecording}
                    disabled={processing}
                    className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl z-10 ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white hover:scale-105'
                    }`}
                  >
                    {processing ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : (isRecording ? <Square size={32} /> : <Mic size={32} />)}
                  </button>
                </div>

                <p className="text-xl font-bold tracking-tight mb-2">
                  {processing ? "Evaluating..." : isRecording ? "I'm listening..." : "Tap to Speak"}
                </p>
                <div className="max-w-xl mx-auto">
                   <p className="text-foreground/40 text-sm italic min-h-[1.5rem]">
                      {transcript || (isRecording ? "Try to speak clearly..." : "Respond to the teacher's task above")}
                   </p>
                </div>
              </div>

              {lastCorrection && (
                <div className="mt-auto animate-in slide-in-from-bottom duration-500">
                  <div className={`p-6 rounded-[2rem] border-2 flex items-start gap-4 transition-all ${
                    lastCorrection.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-primary/5 border-primary/20'
                  }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      lastCorrection.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'
                    }`}>
                      {lastCorrection.isCorrect ? <CheckCircle2 size={24} /> : <Sparkles size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-black uppercase tracking-wider text-primary">Tutor Feedback</p>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-[10px] font-black">
                          {lastCorrection.fluencyScore}/10
                        </span>
                      </div>
                      <p className="text-lg font-medium leading-relaxed">{lastCorrection.corrected}</p>
                      <p className="text-sm text-foreground/50 mt-2 leading-relaxed">
                         {lastCorrection.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
