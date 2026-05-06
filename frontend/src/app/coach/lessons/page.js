'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { BookOpen, GraduationCap, Trophy, Play, Star, Plus } from 'lucide-react';

export default function LessonLibrary() {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const topics = ['Grammar', 'Daily Conversation', 'Interview English', 'Business English'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        api.get('/english/lessons'),
        api.get('/english/lessons/progress')
      ]);
      setLessons(lessonsRes.data);
      setProgress(progressRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId) => {
    return progress.find(p => p.lessonId?._id === lessonId || p.lessonId === lessonId);
  };

  const isLessonLocked = (lesson) => {
    if (lesson.sequence <= 1) return false;
    
    // Find the previous lesson in the same level/topic
    const prevLesson = lessons.find(l => 
      l.level === lesson.level && 
      l.topic === lesson.topic && 
      l.sequence === lesson.sequence - 1
    );
    
    if (!prevLesson) return false;
    
    const prevProgress = getLessonProgress(prevLesson._id);
    return !prevProgress || !prevProgress.unlockedNext;
  };

  const handleGenerate = async (level, topic) => {
    setCreating(true);
    try {
      const res = await api.post('/english/lessons/generate', { level, topic });
      router.push(`/coach/lesson/${res.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate lesson';
      alert(msg);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading Library...</div>;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lesson Library</h1>
          <p className="text-foreground/60 mt-1">Master each step to unlock the next challenge</p>
        </div>
        <button 
          onClick={() => router.push('/coach/start')}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to Conversation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {topics.map(topic => (
          <div key={topic} className="glass-card p-6 rounded-2xl border border-primary/10">
            <h3 className="font-bold mb-4">{topic}</h3>
            <div className="space-y-2">
              {levels.map(level => (
                <button
                  key={`${topic}-${level}`}
                  onClick={() => handleGenerate(level, topic)}
                  disabled={creating}
                  className="w-full text-left text-xs p-2 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    {level === 'Beginner' && <BookOpen size={14} />}
                    {level === 'Intermediate' && <GraduationCap size={14} />}
                    {level === 'Advanced' && <Trophy size={14} />}
                    {level}
                  </span>
                  <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-6">Your Path</h2>
      {lessons.length === 0 ? (
        <p className="text-foreground/40 italic">No lessons in the library yet. Generate one above!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map(lesson => {
            const lessonProgress = getLessonProgress(lesson._id);
            const locked = isLessonLocked(lesson);
            
            return (
              <div 
                key={lesson._id} 
                className={`glass-card p-6 rounded-2xl flex flex-col transition-all group relative ${
                  locked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-primary/50 cursor-pointer'
                }`}
                onClick={() => !locked && router.push(`/coach/lesson/${lesson._id}`)}
              >
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-background/80 p-3 rounded-full shadow-lg">
                      <Star size={24} className="text-foreground/20" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">
                    Lesson {lesson.sequence} • {lesson.level}
                  </span>
                  {lessonProgress?.completed && (
                    <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-2 line-clamp-1">{lesson.title}</h3>
                <p className="text-sm text-foreground/60 line-clamp-2 mb-6">
                  {lesson.explanation}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star 
                          key={i} 
                          size={10} 
                          className={lessonProgress?.score >= i * 2 ? "text-yellow-500 fill-yellow-500" : "text-foreground/10"} 
                        />
                      ))}
                    </div>
                    {lessonProgress?.score > 0 && (
                      <span className="text-[10px] font-bold text-foreground/40">{lessonProgress.score}/10</span>
                    )}
                  </div>
                  
                  {!locked && (
                    <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:scale-110 transition-all">
                      <Play size={16} fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
