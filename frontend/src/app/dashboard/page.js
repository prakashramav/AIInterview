'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { Plus, Clock, CheckCircle2, ChevronRight, Play, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/interview');
        setInterviews(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [router]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-foreground/60 mt-1">Manage your mock interviews and track progress</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link href="/coach/start" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-card border border-border text-foreground px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-foreground/5 transition-all shadow-sm text-sm md:text-base">
            <MessageSquare size={18} className="text-primary" />
            English Coach
          </Link>
          <Link href="/interview/start" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md text-sm md:text-base">
            <Plus size={18} />
            New Interview
          </Link>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-card text-center py-12 md:py-20 px-6 rounded-2xl md:rounded-[32px] border border-dashed border-border/50">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-3">No interviews yet</h3>
          <p className="text-foreground/60 mb-8 max-w-md mx-auto text-sm md:text-base">You haven't completed any mock interviews. Start one now to practice your skills!</p>
          <Link href="/interview/start" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            Start First Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {interviews.map(interview => (
            <div key={interview._id} className="glass-card p-5 md:p-6 rounded-2xl md:rounded-[24px] flex flex-col hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 group border border-border/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{interview.jobRole}</h3>
                  <span className="text-xs md:text-sm font-medium text-foreground/40 uppercase tracking-wider">{interview.experienceLevel}</span>
                </div>
                {interview.status === 'completed' ? (
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 border border-green-500/20">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                ) : (
                  <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 border border-yellow-500/20">
                    <Clock size={12} /> In Progress
                  </span>
                )}
              </div>

              {interview.status === 'completed' && interview.evaluation && (
                <div className="mb-6 mt-auto">
                  <div className="flex items-end gap-1.5 mb-2">
                    <span className="text-3xl font-black text-primary leading-none">{interview.evaluation.score}</span>
                    <span className="text-xs font-bold text-foreground/40 mb-0.5 uppercase tracking-tighter">/ 10 Score</span>
                  </div>
                  <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${(interview.evaluation.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-auto pt-5 border-t border-border/50 flex items-center justify-end">
                {interview.status === 'completed' ? (
                  <Link href={`/interview/${interview._id}/feedback`} className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Full Feedback <ChevronRight size={16} />
                  </Link>
                ) : (
                  <Link href={`/interview/${interview._id}`} className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Continue Practice <Play size={16} className="fill-primary" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
