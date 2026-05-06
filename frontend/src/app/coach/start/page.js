'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { BookOpen, GraduationCap, Trophy } from 'lucide-react';

export default function StartCoach() {
  const router = useRouter();
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/english/coach/start', { level });
      router.push(`/coach/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start coaching session');
      setLoading(false);
    }
  };

  const levels = [
    { name: 'Beginner', icon: <BookOpen />, desc: 'Simple sentences & daily life' },
    { name: 'Intermediate', icon: <GraduationCap />, desc: 'Grammar & fluency focus' },
    { name: 'Advanced', icon: <Trophy />, desc: 'Debate & storytelling' }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl -mr-32 md:-mr-48 -mt-32 md:-mt-48" />
      <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl -ml-32 md:-ml-48 -mb-32 md:-mb-48" />

      <div className="glass-card w-full max-w-3xl p-6 md:p-10 rounded-[32px] md:rounded-[40px] relative z-10 border border-white/20 shadow-2xl">
        <div className="mb-8 md:mb-10 text-center">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="group flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-all self-start sm:self-auto"
            >
              <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary transition-colors">←</div>
              Back
            </button>
            <button 
              onClick={() => router.push('/coach/lessons')} 
              className="w-full sm:w-auto text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            >
              60-Day Program Library →
            </button>
          </div>
          
          <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
             <GraduationCap className="text-primary w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">AI English Coach</h2>
          <p className="text-foreground/50 text-base md:text-lg max-w-md mx-auto leading-relaxed px-4">
            Choose your proficiency level and start a conversation to master your fluency.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {levels.map(l => (
              <button
                key={l.name}
                type="button"
                onClick={() => setLevel(l.name)}
                className={`group relative p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-2 text-left transition-all flex flex-row sm:flex-col items-center text-center gap-4 sm:gap-5 ${
                  level === l.name 
                  ? 'bg-primary border-primary shadow-[0_20px_50px_rgba(var(--primary-rgb),0.2)] scale-[1.02] sm:scale-105' 
                  : 'bg-card/50 border-border hover:border-primary/30 text-foreground/80'
                }`}
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                  level === l.name 
                  ? 'bg-white/20 text-white rotate-12' 
                  : 'bg-primary/10 text-primary group-hover:rotate-6'
                }`}>
                  {l.icon}
                </div>
                <div className="text-left sm:text-center">
                  <h3 className={`font-black text-lg md:text-xl mb-1 sm:mb-2 ${level === l.name ? 'text-white' : 'text-foreground'}`}>
                    {l.name}
                  </h3>
                  <p className={`text-[10px] md:text-xs leading-relaxed ${level === l.name ? 'text-white/70' : 'text-foreground/40'}`}>
                    {l.desc}
                  </p>
                </div>

                {/* Selection Indicator */}
                {level === l.name && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 w-2 h-2 bg-white rounded-full animate-ping" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 md:pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group bg-foreground text-background py-5 md:py-6 rounded-2xl md:rounded-3xl font-black hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-xl md:text-2xl shadow-2xl flex items-center justify-center gap-3 overflow-hidden"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 md:w-6 md:h-6 border-4 border-background/30 border-t-background rounded-full animate-spin" />
                  <span>Entering Classroom...</span>
                </>
              ) : (
                <>
                  <span>Start Practicing Now</span>
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </>
              )}
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
            <p className="text-center text-[10px] text-foreground/30 mt-6 md:mt-8 uppercase tracking-[0.2em] font-bold">
              AI Teacher powered by Gemini 2.0 Flash
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
