'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Cookies from 'js-cookie';
import { 
  Lock, 
  CheckCircle2, 
  Play, 
  AlertCircle, 
  Sparkles, 
  Calendar,
  ChevronRight
} from 'lucide-react';

export default function CurriculumPage() {
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = Cookies.get('token');
    if (!token) {
      router.push(`/auth/login?redirect=/coach/lessons`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        api.get('/english/lessons'),
        api.get('/progress')
      ]);
      setLessons(lessonsRes.data.sort((a, b) => a.day - b.day));
      setUserProgress(progressRes.data);
    } catch (err) {
      console.error('Failed to fetch curriculum:', err);
      setError('Could not load curriculum. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CurriculumSkeleton />;

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-10 rounded-[32px] border border-border/50 max-w-md shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black mb-2">Couldn't load curriculum</h2>
          <p className="text-foreground/60 mb-8 font-medium">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-primary text-primary-foreground px-10 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Group lessons by week (7 days per week)
  const weeks = [];
  for (let i = 0; i < lessons.length; i += 7) {
    weeks.push(lessons.slice(i, i + 7));
  }

  const currentDay = userProgress?.currentDay || 1;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={12} /> Full Course
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">The 60-Day <span className="text-primary">Fluency</span> Path</h1>
        <p className="text-foreground/60 text-lg max-w-2xl font-medium leading-relaxed">
          Master professional English with our structured daily curriculum. Each day builds upon the previous one.
        </p>
      </div>

      <div className="space-y-16">
        {weeks.map((weekLessons, weekIdx) => (
          <div key={weekIdx} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black whitespace-nowrap">Week {weekIdx + 1}</h2>
              <div className="h-px bg-border w-full" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {weekLessons.map((lesson) => {
                const isLocked = lesson.day > currentDay;
                const isCompleted = userProgress?.lessonsCompleted?.some(l => l.lessonId === lesson._id);
                
                return (
                  <div 
                    key={lesson._id}
                    onClick={() => !isLocked && router.push(`/coach/lesson/${lesson._id}`)}
                    className={`group relative glass-card p-6 rounded-[28px] border transition-all flex flex-col h-full ${
                      isLocked 
                        ? 'opacity-50 border-border bg-foreground/5 cursor-not-allowed grayscale' 
                        : 'border-border/50 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLocked ? 'text-foreground/40' : 'text-primary'}`}>
                        Day {lesson.day}
                      </span>
                      {isLocked ? (
                        <div className="p-2 bg-foreground/5 rounded-lg">
                          <Lock size={14} className="text-foreground/20" />
                        </div>
                      ) : isCompleted ? (
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <CheckCircle2 size={16} className="text-green-500" />
                        </div>
                      ) : (
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Play size={14} fill="currentColor" />
                        </div>
                      )}
                    </div>

                    <h3 className={`font-black text-lg leading-tight mb-2 ${isLocked ? 'text-foreground/40' : 'text-foreground'}`}>
                      {lesson.title}
                    </h3>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isLocked ? 'text-foreground/20' : 'text-foreground/40'}`}>
                      {lesson.topic} • {lesson.level}
                    </p>

                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                        {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Ready to Start'}
                      </span>
                      {!isLocked && <ChevronRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CurriculumSkeleton() {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 animate-pulse">
      <div className="mb-12">
        <div className="h-6 w-32 bg-foreground/10 rounded-full mb-4" />
        <div className="h-12 w-96 bg-foreground/10 rounded-xl mb-4" />
        <div className="h-6 w-128 bg-foreground/5 rounded-lg" />
      </div>

      <div className="space-y-12">
        <div className="h-8 w-40 bg-foreground/10 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-foreground/5 rounded-[28px] border border-border/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
