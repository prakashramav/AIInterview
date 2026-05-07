'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { 
  Trophy, 
  Target, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ReportPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { sessionId } = params;
  const router = useRouter();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/interview/report/${sessionId}`);
        setReport(res.data);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (!report || !report.evaluation) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-6 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Evaluation Not Found</h2>
      <p className="text-gray-400 mb-6">We couldn't generate a report for this session.</p>
      <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-blue-600 rounded-xl font-bold">Go to Dashboard</button>
    </div>
  );

  const { evaluation } = report;

  // Helper to find evaluation keys case-insensitively or with aliases
  const getEvalData = (keys, defaultValue = []) => {
    for (const key of keys) {
      if (evaluation[key]) return evaluation[key];
      // Check lowercase match
      const found = Object.keys(evaluation).find(k => 
        k.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (found) return evaluation[found];
    }
    return defaultValue;
  };

  const recommendation = getEvalData(['Overall recommendation', 'recommendation'], 'Maybe');
  const strengths = getEvalData(['Top 3 strengths', 'strengths'], []);
  const improvements = getEvalData(['Top 3 areas to improve', 'improvements', 'areas to improve'], []);
  const techScore = getEvalData(['Technical knowledge', 'technical'], 0);
  const commScore = getEvalData(['Communication clarity', 'communication'], 0);
  const probScore = getEvalData(['Problem-solving approach', 'problem solving'], 0);

  const getRecommendationColor = (rec) => {
    if (!rec) return 'bg-gray-500 text-white shadow-gray-500/20';
    if (rec.includes('Strong Hire')) return 'bg-green-500 text-green-950 shadow-green-500/20';
    if (rec.includes('Hire')) return 'bg-blue-500 text-blue-950 shadow-blue-500/20';
    if (rec.includes('Maybe')) return 'bg-yellow-500 text-yellow-950 shadow-yellow-500/20';
    return 'bg-red-500 text-red-950 shadow-red-500/20';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-3 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-all border border-gray-800"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black mb-1">Interview Report</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{report.topic}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 rounded-2xl font-bold text-sm border border-gray-800 hover:bg-gray-800 transition-all"
            >
              <Share2 size={18} />
              Share Report
            </button>
            <div className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-2xl ${getRecommendationColor(recommendation)}`}>
              {recommendation}
            </div>
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Technical Knowledge', value: techScore, icon: <Trophy size={24} className="text-yellow-500" /> },
            { label: 'Communication Clarity', value: commScore, icon: <MessageSquare size={24} className="text-blue-500" /> },
            { label: 'Problem Solving', value: probScore, icon: <Target size={24} className="text-purple-500" /> }
          ].map((score, i) => (
            <div key={i} className="bg-gray-900/50 p-8 rounded-[32px] border border-white/5 flex flex-col items-center text-center shadow-xl">
              <div className="p-4 bg-gray-950 rounded-2xl mb-4 border border-gray-800">
                {score.icon}
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{score.label}</p>
              <div className="text-5xl font-black mb-2">{score.value}<span className="text-xl text-gray-700">/10</span></div>
              <div className="w-full h-1.5 bg-gray-950 rounded-full mt-4 overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${(score.value / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Strengths */}
          <div className="space-y-4">
            <h3 className="text-xl font-black flex items-center gap-2 mb-6">
              <CheckCircle2 className="text-green-500" />
              Key Strengths
            </h3>
            {strengths.map((s, i) => (
              <div key={i} className="bg-green-500/5 border-l-4 border-green-500 p-6 rounded-r-2xl shadow-lg">
                <p className="text-gray-100 font-medium leading-relaxed">{s}</p>
              </div>
            ))}
            {strengths.length === 0 && <p className="text-gray-500 italic">No specific strengths listed.</p>}
          </div>

          {/* Improvements */}
          <div className="space-y-4">
            <h3 className="text-xl font-black flex items-center gap-2 mb-6">
              <AlertCircle className="text-yellow-500" />
              Areas to Improve
            </h3>
            {improvements.map((item, i) => (
              <div key={i} className="bg-yellow-500/5 border-l-4 border-yellow-500 p-6 rounded-r-2xl shadow-lg">
                <p className="text-gray-100 font-medium leading-relaxed mb-3">{item}</p>
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-yellow-500 tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full">
                  Action Suggestion
                </div>
              </div>
            ))}
            {improvements.length === 0 && <p className="text-gray-500 italic">No improvement areas listed.</p>}
          </div>
        </div>

        {/* Transcript Accordion */}
        <div className="bg-gray-900/50 rounded-[32px] border border-white/5 overflow-hidden mb-12">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-8 hover:bg-gray-800/50 transition-all"
          >
            <h3 className="text-xl font-black">Full Interview Transcript</h3>
            {showTranscript ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {showTranscript && (
            <div className="px-8 pb-8 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
              {report.messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    {msg.role === 'ai' ? 'Aryan Mehta' : 'Candidate'}
                  </span>
                  <div className={`max-w-[80%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                    msg.role === 'ai' ? 'bg-gray-800 text-gray-100 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => router.push('/interview/start')}
            className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/20"
          >
            Practice Again
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black text-xl border border-gray-800 hover:bg-gray-800 transition-all"
          >
            Go to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
