'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { 
  Calendar, 
  Flame, 
  Play, 
  Trophy, 
  ChevronRight, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // Handle Google OAuth token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        Cookies.set('token', urlToken, { expires: 7 });
        // Clean the URL without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = Cookies.get('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const [userRes, progressRes, interviewRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/progress'),
          api.get('/interview')
        ]);
        setUser(userRes.data);
        setProgress(progressRes.data);
        setInterviews(interviewRes.data);
      } catch (err) {
        console.error('Dashboard error:', err);
        if (err.response?.status === 401) {
          router.push('/auth/login');
        } else {
          setError('Failed to reach the server. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="glass-card p-8 rounded-3xl border border-red-500/20 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-foreground/60 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const progressPercentage = (progress?.currentDay / (progress?.totalDays || 60)) * 100;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <div className="flex items-center gap-2 text-foreground/50 mt-1">
            <Calendar size={16} />
            <span className="text-sm font-medium">{today}</span>
          </div>
        </div>
        <Link 
          href="/interview/start"
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
        >
          <Briefcase size={20} />
          Start Technical Interview
        </Link>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Progress Card */}
        <div className="md:col-span-8 glass-card p-6 md:p-8 rounded-[32px] border border-border/50 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          
          <div>
            <div className="flex items-center gap-2 text-primary mb-4">
              <TrendingUp size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Overall Progress</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-2">
              Day {progress?.currentDay} <span className="text-foreground/20 text-2xl md:text-3xl">of 60</span>
            </h2>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-bold text-foreground/60">{Math.round(progressPercentage)}% Completed</span>
              <span className="text-xs font-bold text-foreground/30 uppercase">{60 - progress?.currentDay} days remaining</span>
            </div>
            <div className="w-full bg-foreground/5 h-4 rounded-full overflow-hidden p-1 border border-border/50">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="md:col-span-4 glass-card p-6 md:p-8 rounded-[32px] border border-border/50 flex flex-col items-center justify-center text-center group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-500">
              <Flame size={40} className="text-orange-500 fill-orange-500 animate-pulse" />
            </div>
            <h3 className="text-3xl font-black">{progress?.streak || 0} Day Streak</h3>
            <p className="text-foreground/50 font-medium mt-1">Keep it up! 🔥</p>
          </div>
        </div>

        {/* Latest Interview Feedback */}
        <div className="md:col-span-12 lg:col-span-12 glass-card p-6 md:p-8 rounded-[32px] border border-border/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Sparkles className="text-primary" size={28} />
              Latest Interview Feedback
            </h3>
            <Link href="/dashboard/interviews" className="text-sm font-bold text-primary hover:underline">
              View All History
            </Link>
          </div>

          {interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interviews.filter(i => i.status === 'completed').slice(0, 1).map((interview) => (
                <div key={interview._id} className="md:col-span-3 grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Score Card */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center bg-primary/5 rounded-3xl p-8 border border-primary/10">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/10" />
                        <circle 
                          cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                          strokeDasharray={364.4} 
                          strokeDashoffset={364.4 - (364.4 * (interview.evaluation?.score || 0)) / 100}
                          strokeLinecap="round" 
                          className="text-primary transition-all duration-1000" 
                        />
                      </svg>
                      <span className="absolute text-3xl font-black">{interview.evaluation?.score}%</span>
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-primary/60">Overall Score</p>
                    <p className="text-lg font-bold mt-2 capitalize">{interview.jobRole}</p>
                  </div>

                  {/* Feedback Details */}
                  <div className="md:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-foreground/5 p-5 rounded-2xl border border-border/50">
                        <h4 className="text-xs font-black uppercase tracking-widest text-green-500 mb-3 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Key Strengths
                        </h4>
                        <ul className="space-y-2">
                          {interview.evaluation?.strengths?.slice(0, 2).map((s, idx) => (
                            <li key={idx} className="text-sm font-medium text-foreground/70">• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-foreground/5 p-5 rounded-2xl border border-border/50">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                          <AlertCircle size={14} /> Improvements
                        </h4>
                        <ul className="space-y-2">
                          {interview.evaluation?.weaknesses?.slice(0, 2).map((w, idx) => (
                            <li key={idx} className="text-sm font-medium text-foreground/70">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Expert Suggestion</h4>
                      <p className="text-sm font-medium text-foreground/80 italic line-clamp-2">
                        "{interview.evaluation?.suggestions?.[0]}"
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push(`/interview/${interview._id}/feedback`)}
                      className="w-full py-4 rounded-2xl bg-foreground text-background font-black text-sm hover:bg-foreground/90 transition-all flex items-center justify-center gap-2"
                    >
                      View Detailed Analysis <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-foreground/5 rounded-3xl border border-dashed border-border">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-primary/20" size={32} />
              </div>
              <h4 className="text-lg font-bold mb-1">No interviews yet</h4>
              <p className="text-foreground/40 text-sm mb-6 max-w-xs mx-auto">Complete your first technical interview to get AI-powered feedback.</p>
              <Link 
                href="/interview/start" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Start Now
              </Link>
            </div>
          )}
        </div>

        {/* Continue Learning */}
        <div className="md:col-span-12 lg:col-span-7 glass-card p-6 md:p-8 rounded-[32px] border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} />
              Continue Learning
            </h3>
            <Link href="/coach/lessons" className="text-sm font-bold text-primary hover:underline">
              View Curriculum
            </Link>
          </div>
          
          <div className="bg-foreground/5 rounded-2xl p-5 border border-border/50 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary">
                {progress?.currentDay}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Next Up</p>
                <h4 className="font-bold text-lg">Daily Fluency Training</h4>
              </div>
            </div>
            <Link 
              href="/coach/lessons"
              className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all shadow-lg"
            >
              <Play size={20} className="ml-1" fill="currentColor" />
            </Link>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="md:col-span-12 lg:col-span-5 glass-card p-6 md:p-8 rounded-[32px] border border-border/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="text-primary" size={24} />
            Recent Sessions
          </h3>
          
          <div className="space-y-4">
            {progress?.lessonsCompleted?.length > 0 ? (
              progress.lessonsCompleted.slice(-5).reverse().map((session, i) => (
                <div key={i} className="flex items-center justify-between group border-b border-border/30 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{session.title}</h4>
                      <p className="text-[10px] text-foreground/40 uppercase font-black mt-0.5">
                        {new Date(session.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(session.fluencyScore)}`}>
                    {session.fluencyScore}%
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground/40 text-sm font-medium italic">No sessions completed yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function getScoreColor(score) {
  if (score >= 80) return 'bg-green-500/10 text-green-500 border-green-500/20';
  if (score >= 50) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  return 'bg-red-500/10 text-red-500 border-red-500/20';
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-foreground/10 rounded-xl" />
          <div className="h-4 w-40 bg-foreground/5 rounded-lg" />
        </div>
        <div className="h-14 w-56 bg-foreground/10 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 h-64 bg-foreground/5 rounded-[32px]" />
        <div className="md:col-span-4 h-64 bg-foreground/5 rounded-[32px]" />
        <div className="md:col-span-12 lg:col-span-7 h-56 bg-foreground/5 rounded-[32px]" />
        <div className="md:col-span-12 lg:col-span-5 h-56 bg-foreground/5 rounded-[32px]" />
      </div>
    </div>
  );
}
