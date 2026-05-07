'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  Search,
  Filter
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInterviews = async () => {
      const token = Cookies.get('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const res = await api.get('/interview');
        setInterviews(res.data);
      } catch (err) {
        setError('Failed to load interview history.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading history...</div>;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors font-bold text-sm group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Interview <span className="text-primary">History</span></h1>
        <p className="text-foreground/60 font-medium">Review your past performances and track your growth over time.</p>
      </div>

      <div className="space-y-4">
        {interviews.length > 0 ? (
          interviews.map((interview) => (
            <div 
              key={interview._id}
              onClick={() => {
                if (interview.status === 'completed') {
                  router.push(`/interview/${interview._id}/feedback`);
                } else {
                  router.push(`/interview/${interview._id}`);
                }
              }}
              className="glass-card p-6 rounded-[28px] border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  interview.status === 'completed' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                }`}>
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black group-hover:text-primary transition-colors capitalize">
                    {interview.jobRole}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(interview.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {interview.experienceLevel}</span>
                    <span className={`flex items-center gap-1.5 ${interview.status === 'completed' ? 'text-green-500' : 'text-amber-500'}`}>
                      {interview.status === 'completed' ? <CheckCircle2 size={14} /> : null}
                      {interview.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {interview.status === 'completed' && (
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-foreground/30">Final Score</p>
                    <p className="text-2xl font-black text-primary">{interview.evaluation?.score}%</p>
                  </div>
                )}
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass-card rounded-[40px] border border-dashed border-border">
            <Briefcase size={48} className="text-foreground/10 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No interviews found</h2>
            <p className="text-foreground/40 mb-8">Start your first technical interview to begin tracking history.</p>
            <Link href="/interview/start" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold">Start Interview</Link>
          </div>
        )}
      </div>
    </div>
  );
}
