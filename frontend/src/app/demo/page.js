'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Code, 
  Terminal, 
  Layout, 
  ArrowRight, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp,
  Brain,
  MessageCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DemoInterview() {
  const [step, setStep] = useState(1); // 1: Topic, 2: Interview, 3: Results
  const [topic, setTopic] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startDemo = async (selectedTopic) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/demo/start`, { topic: selectedTopic });
      setTopic(selectedTopic);
      setSessionId(res.data.sessionId);
      setMessages([{ role: 'ai', content: res.data.firstQuestion }]);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start demo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/demo/answer`, { 
        sessionId, 
        answer: userMessage 
      });

      if (res.data.done) {
        setEvaluation(res.data.evaluation);
        setStep(3);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: res.data.nextQuestion }]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Demo Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary z-50">
        ✨ This is a 3-question demo. <Link href="/auth/signup" className="underline hover:text-primary/80">Sign up for unlimited sessions</Link>
      </div>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {step === 1 && (
          <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Choose your <span className="text-primary">Demo</span> Topic</h1>
              <p className="text-foreground/60 text-lg">Pick a domain to start a quick 3-question evaluation</p>
            </div>

            {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl mb-8 text-center font-medium border border-red-500/20">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TopicCard 
                icon={<Code className="w-8 h-8 text-blue-500" />}
                title="React"
                description="Hooks, performance, and advanced patterns."
                onClick={() => startDemo('react')}
                loading={loading && topic === 'react'}
              />
              <TopicCard 
                icon={<Terminal className="w-8 h-8 text-green-500" />}
                title="DSA"
                description="Algorithms, data structures, and optimization."
                onClick={() => startDemo('dsa')}
                loading={loading && topic === 'dsa'}
              />
              <TopicCard 
                icon={<Layout className="w-8 h-8 text-purple-500" />}
                title="System Design"
                description="Scalability, databases, and microservices."
                onClick={() => startDemo('system-design')}
                loading={loading && topic === 'system-design'}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-3xl w-full h-[600px] flex flex-col glass-card rounded-[32px] overflow-hidden border border-border/50 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Brain className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold uppercase tracking-wider text-xs text-primary">Demo Interview</h2>
                  <p className="text-sm font-black capitalize">{topic} Session</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Progress</p>
                <p className="text-sm font-black text-primary">Question {Math.ceil(messages.length / 2)} of 3</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-dots-pattern">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    m.role === 'ai' 
                      ? 'bg-secondary text-foreground rounded-tl-none border border-border/50' 
                      : 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20'
                  }`}>
                    <p className="text-sm md:text-base leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-secondary p-4 rounded-2xl rounded-tl-none border border-border/50 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={submitAnswer} className="p-6 bg-card/50 border-t border-border/50">
              <div className="relative flex items-center gap-3">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={loading ? "AI is thinking..." : "Type your technical answer here..."}
                  disabled={loading}
                  className="flex-1 bg-background/50 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 text-sm md:text-base"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-primary text-primary-foreground p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && evaluation && (
          <div className="max-w-4xl w-full animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold uppercase tracking-wider mb-4">
                <CheckCircle2 size={14} /> Interview Complete
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-2">Demo Report</h2>
              <p className="text-foreground/60 text-lg">Here's how you performed in this quick session</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="glass-card p-8 rounded-[32px] border border-border/50 flex flex-col items-center justify-center text-center">
                <ProgressCircle score={evaluation.technicalScore} label="Technical" color="text-blue-500" />
              </div>
              <div className="glass-card p-8 rounded-[32px] border border-border/50 flex flex-col items-center justify-center text-center">
                <ProgressCircle score={evaluation.communicationScore} label="Communication" color="text-purple-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="glass-card p-8 rounded-[32px] border border-border/50">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="text-yellow-500" size={20} />
                  Strengths
                </h3>
                <ul className="space-y-4">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-500 mt-1 shrink-0" size={18} />
                      <span className="font-medium text-foreground/80">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-8 rounded-[32px] border border-border/50">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="text-primary" size={20} />
                  Improvements
                </h3>
                <ul className="space-y-4">
                  {evaluation.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-primary/30 mt-1.5 shrink-0" />
                      <span className="font-medium text-foreground/80">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center p-12 glass-card rounded-[40px] border-2 border-primary/20 bg-primary/5 shadow-2xl shadow-primary/10 relative overflow-hidden">
               <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
               <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
               
               <h3 className="text-3xl md:text-4xl font-black mb-6 relative z-10">Want a full practice session?</h3>
               <p className="text-lg text-foreground/70 mb-10 max-w-2xl mx-auto relative z-10">
                 Our full version includes 20+ questions, detailed AI feedback on every sentence, and a complete 60-day roadmap.
               </p>
               <Link href="/auth/signup" className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 relative z-10">
                 Sign up free <ArrowRight size={24} />
               </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TopicCard({ icon, title, description, onClick, loading }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="glass-card p-8 rounded-[32px] border border-border/50 text-left hover:border-primary transition-all hover:scale-[1.02] active:scale-98 group flex flex-col h-full relative overflow-hidden"
    >
      <div className="mb-6 p-4 bg-background rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-2">{title}</h3>
      <p className="text-foreground/50 font-medium leading-relaxed mb-8">{description}</p>
      
      <div className="mt-auto flex items-center gap-2 text-primary font-bold">
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Starting...
          </>
        ) : (
          <>
            Start Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </div>
    </button>
  );
}

function ProgressCircle({ score, label, color }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg className="w-40 h-40 transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-foreground/5"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-4xl font-black tracking-tighter">{score}%</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{label}</span>
      </div>
    </div>
  );
}
