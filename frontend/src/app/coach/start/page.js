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
      const res = await api.post('/coach/start', { level });
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
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-2xl p-8 rounded-3xl">
        <div className="mb-8 text-center">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => router.push('/dashboard')} className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">← Back</button>
            <button onClick={() => router.push('/coach/lessons')} className="text-sm font-medium text-primary hover:underline transition-all">Browse Lesson Library →</button>
          </div>
          <h2 className="text-4xl font-bold mb-3">AI English Coach</h2>
          <p className="text-foreground/60">Choose your level and start practicing your communication skills</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map(l => (
              <button
                key={l.name}
                type="button"
                onClick={() => setLevel(l.name)}
                className={`p-6 rounded-2xl border text-left transition-all flex flex-col items-center text-center gap-3 ${
                  level === l.name 
                  ? 'bg-primary/10 border-primary shadow-lg scale-105' 
                  : 'bg-card border-border hover:border-primary/50 text-foreground/80'
                }`}
              >
                <div className={`p-3 rounded-full ${level === l.name ? 'bg-primary text-white' : 'bg-foreground/5'}`}>
                  {l.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{l.name}</h3>
                  <p className="text-xs text-foreground/50 mt-1">{l.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 text-xl shadow-xl hover:shadow-primary/20"
          >
            {loading ? 'Entering Classroom...' : 'Start Practicing Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
