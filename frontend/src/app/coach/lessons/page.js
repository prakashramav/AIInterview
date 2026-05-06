'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { BookOpen, GraduationCap, Trophy, Play, Star, Plus, Lock, CheckCircle2, Sparkles, Calendar } from 'lucide-react';

export default function EnglishProgram() {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        api.get('/english/lessons'),
        api.get('/english/lessons/progress')
      ]);
      setLessons(lessonsRes.data.sort((a, b) => a.day - b.day));
      setProgress(progressRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDayProgress = (day) => {
    const lesson = lessons.find(l => l.day === day);
    if (!lesson) return null;
    return progress.find(p => p.lessonId?._id === lesson._id || p.lessonId === lesson._id);
  };

  const isDayLocked = (day) => {
    if (day === 1) return false;
    const prevDayProgress = getDayProgress(day - 1);
    return !prevDayProgress || (!prevDayProgress.unlockedNext && prevDayProgress.score < 6);
  };

  const [generatingDay, setGeneratingDay] = useState(null);

  const handleDayClick = async (day, lesson) => {
    if (isDayLocked(day) || generatingDay) return;

    if (lesson) {
      router.push(`/coach/lesson/${lesson._id}`);
    } else {
      // Auto-generate if missing
      setGeneratingDay(day);
      try {
        const res = await api.post('/english/lessons/generate', { day });
        router.push(`/coach/lesson/${res.data._id}`);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to start lesson");
        setGeneratingDay(null);
      }
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading Curriculum...</div>;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-6">
      {/* ... header remains same ... */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Master Course
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">60-Day AI English Coach</h1>
          <p className="text-foreground/60 mt-2 text-lg">Your personalized path to professional fluency, one day at a time.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
             <p className="text-xs font-bold text-foreground/40 uppercase">Your Progress</p>
             <p className="text-2xl font-black text-primary">{progress.filter(p => p.completed).length} / 60</p>
          </div>
          <button 
            onClick={() => router.push('/coach/start')}
            className="bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            Practice Conversation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 60 }).map((_, i) => {
          const day = i + 1;
          const lesson = lessons.find(l => l.day === day);
          const dayProgress = getDayProgress(day);
          const locked = isDayLocked(day);
          const completed = dayProgress?.completed;
          const isGenerating = generatingDay === day;

          return (
            <div 
              key={day}
              onClick={() => handleDayClick(day, lesson)}
              className={`relative aspect-square glass-card rounded-2xl border transition-all flex flex-col p-4 group cursor-pointer ${
                locked 
                  ? 'opacity-40 border-border bg-foreground/5 cursor-not-allowed' 
                  : completed 
                    ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50' 
                    : 'border-primary/20 hover:border-primary shadow-sm hover:shadow-primary/10'
              } ${isGenerating ? 'animate-pulse' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase tracking-tighter ${locked ? 'text-foreground/40' : 'text-primary'}`}>
                  Day {day}
                </span>
                {locked ? (
                  <Lock size={14} className="text-foreground/20" />
                ) : isGenerating ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : completed ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <Play size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                )}
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <h3 className={`text-xs font-bold leading-tight line-clamp-2 ${locked ? 'text-foreground/20' : 'text-foreground'}`}>
                  {isGenerating ? "Generating..." : lesson?.title || `Day ${day} Lesson`}
                </h3>
                
                {!locked && lesson && (
                  <p className="text-[9px] text-foreground/40 mt-1 uppercase font-bold tracking-widest">{lesson.level}</p>
                )}
                
                {!locked && dayProgress?.score > 0 && (
                  <div className="flex gap-0.5 mt-2">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star 
                        key={si} 
                        size={8} 
                        className={dayProgress.score >= (si + 1) * 2 ? "text-yellow-500 fill-yellow-500" : "text-foreground/10"} 
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Progress Bar for the day if active */}
              {!locked && !completed && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 rounded-b-2xl overflow-hidden">
                  <div className="h-full bg-primary w-1/3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
