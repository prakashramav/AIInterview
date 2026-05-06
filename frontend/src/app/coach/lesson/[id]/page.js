'use client';
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Sparkles, Mic, Square, Play, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import useMediaStream from '@/hooks/useMediaStream';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import VideoPlayer from '@/components/VideoPlayer';

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
    const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
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
          context: `Lesson Topic: ${lesson.topic}, Lesson Title: ${lesson.title}. Current Task: ${lesson.practice[0]}`
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase mb-2 inline-block">
            Step {lesson.sequence} • {lesson.level}
          </span>
          <h1 className="text-2xl font-bold flex items-center gap-2">
             <Sparkles className="text-primary" size={24} />
             {lesson.title}
          </h1>
        </div>
        <button onClick={() => router.push('/coach/lessons')} className="text-sm font-medium hover:text-primary transition-colors">Back to Library</button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
               <Mic className="text-primary" size={40} />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Teacher is Speaking...</h3>
            <p className="text-foreground/70 text-lg leading-relaxed italic">
               "{lesson.explanation}"
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Key Examples
            </h3>
            <div className="space-y-3">
              {lesson.examples.map((ex, i) => (
                <div key={i} className="bg-foreground/5 p-4 rounded-xl border border-border/50 flex items-center justify-between group">
                  <p className="text-sm italic">"{ex}"</p>
                  <button onClick={() => speakText(ex)} className="p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <RefreshCcw size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 flex-1 flex flex-col shadow-sm">
            <h3 className="font-bold mb-6">Speaking Practice</h3>
            <div className="bg-foreground/5 p-4 rounded-xl border border-border mb-6">
              <p className="text-xs font-bold text-foreground/40 mb-2 uppercase">Your Task</p>
              <p className="text-sm font-medium italic">"{lesson.practice[0]}"</p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4 text-center">
              <p className="text-sm italic text-foreground/60">
                {transcript || (isRecording ? "Listening..." : "Click to speak")}
              </p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={isRecording ? handlePracticeAnswer : startRecording}
                  disabled={processing}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white'
                  }`}
                >
                  {processing ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isRecording ? <Square size={24} /> : <Mic size={24} />)}
                </button>
              </div>
            </div>

            {lastCorrection && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl">
                  {lastCorrection.isCorrect ? <CheckCircle2 className="text-green-500" size={18} /> : <AlertCircle className="text-primary" size={18} />}
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase">Coach Feedback</p>
                    <p className="text-sm font-medium">{lastCorrection.corrected}</p>
                    <p className="text-[10px] text-foreground/60 mt-1">Fluency Score: {lastCorrection.fluencyScore}/10</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
