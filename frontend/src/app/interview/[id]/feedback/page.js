'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { ArrowLeft, Target, MessageSquare, Zap, Star, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { use } from 'react';

export default function Feedback({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        if (res.data.status !== 'completed' || !res.data.evaluation) {
          router.push(`/interview/${id}`);
        } else {
          setInterview(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id, router]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!interview) return <div className="flex-1 flex items-center justify-center">Feedback not found</div>;

  const { evaluation } = interview;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-6 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="glass-card p-8 rounded-3xl text-center min-w-[250px] shrink-0 border-t-4 border-t-primary shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Overall Score</h2>
          <div className="text-7xl font-extrabold text-primary mb-2 tracking-tighter">
            {evaluation.score}
            <span className="text-3xl text-foreground/40 font-medium">/10</span>
          </div>
          <p className="text-sm text-foreground/60">
            {evaluation.score >= 8 ? 'Excellent Performance! 🌟' : evaluation.score >= 6 ? 'Good Effort! 👍' : 'Needs Practice 📚'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <ScoreCard title="Technical" score={evaluation.breakdown.technical} icon={<Target className="text-blue-500" />} color="blue" />
          <ScoreCard title="Communication" score={evaluation.breakdown.communication} icon={<MessageSquare className="text-purple-500" />} color="purple" />
          <ScoreCard title="Confidence" score={evaluation.breakdown.confidence} icon={<Zap className="text-yellow-500" />} color="yellow" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-green-500/20">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-green-500">
            <TrendingUp size={20} /> Strengths
          </h3>
          <ul className="space-y-3">
            {evaluation.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <Star size={16} className="text-green-500 shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-red-500/20">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-500">
            <AlertTriangle size={20} /> Areas to Improve
          </h3>
          <ul className="space-y-3">
            {evaluation.weaknesses.map((weak, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2"></div>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <Lightbulb className="text-yellow-500" size={24} /> Actionable Suggestions
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {evaluation.suggestions.map((sug, i) => (
            <li key={i} className="bg-background/50 p-4 rounded-xl border border-border text-sm flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-600 text-xs font-bold shrink-0">{i+1}</span>
              <span className="leading-relaxed">{sug}</span>
            </li>
          ))}
        </ul>
      </div>

      {evaluation.exampleAnswer && (
        <div className="glass-card p-8 rounded-3xl border-l-4 border-l-primary">
          <h3 className="text-xl font-semibold mb-4">Sample Improved Answer</h3>
          <p className="text-sm text-foreground/80 leading-relaxed italic bg-background/50 p-6 rounded-xl border border-border/50">
            "{evaluation.exampleAnswer}"
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, score, icon, color }) {
  const colorMap = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="font-medium text-sm text-foreground/80">{title}</span>
      </div>
      <div>
        <div className="text-3xl font-bold mb-2">{score}<span className="text-sm font-normal text-foreground/40">/10</span></div>
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <div className={`h-full ${colorMap[color]} rounded-full`} style={{ width: `${score * 10}%` }}></div>
        </div>
      </div>
    </div>
  );
}
