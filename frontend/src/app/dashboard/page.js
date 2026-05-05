'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { Plus, Clock, CheckCircle2, ChevronRight, Play } from 'lucide-react';

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
    <div className="flex-1 max-w-6xl mx-auto w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-foreground/60 mt-1">Manage your mock interviews and track progress</p>
        </div>
        <Link href="/interview/start" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md">
          <Plus size={20} />
          New Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-card text-center py-16 rounded-2xl border border-dashed border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">You haven't completed any mock interviews. Start one now to practice your skills!</p>
          <Link href="/interview/start" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all">
            Start First Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map(interview => (
            <div key={interview._id} className="glass-card p-6 rounded-2xl flex flex-col hover:border-primary/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{interview.jobRole}</h3>
                  <span className="text-sm text-foreground/60">{interview.experienceLevel}</span>
                </div>
                {interview.status === 'completed' ? (
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                ) : (
                  <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Clock size={14} /> In Progress
                  </span>
                )}
              </div>

              {interview.status === 'completed' && interview.evaluation && (
                <div className="mb-4 mt-auto">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary">{interview.evaluation.score}</span>
                    <span className="text-foreground/60 mb-1">/ 10 Score</span>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-end">
                {interview.status === 'completed' ? (
                  <Link href={`/interview/${interview._id}/feedback`} className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Feedback <ChevronRight size={16} />
                  </Link>
                ) : (
                  <Link href={`/interview/${interview._id}`} className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Continue <Play size={16} />
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
