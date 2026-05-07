'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Briefcase, GraduationCap } from 'lucide-react';

export default function StartInterview() {
  const router = useRouter();
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/interview/start', { topic: jobRole, experienceLevel });
      router.push(`/interview/${res.data.sessionId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start interview');
      setLoading(false);
    }
  };

  const experienceLevels = ['Fresher', '1-3 yrs', '3-5 yrs', '5+ yrs'];

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-xl p-8 rounded-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Set Up Your Interview</h2>
          <p className="text-foreground/60">Configure the AI interviewer for your target role</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Briefcase size={16} className="text-primary" />
              Target Role
            </label>
            <input 
              type="text" 
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-3"
              placeholder="e.g., Frontend Developer, Data Scientist..."
              required
            />
            
            <div className="flex flex-wrap gap-2">
              {[
                'Software Engineer', 'Frontend Developer', 'Backend Engineer', 
                'Full Stack Developer', 'Data Scientist', 'Product Manager', 
                'DevOps Engineer', 'UI/UX Designer'
              ].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setJobRole(role)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-background/50 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <GraduationCap size={16} className="text-primary" />
              Experience Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {experienceLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setExperienceLevel(level)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    experienceLevel === level 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'border-border hover:border-primary/50 text-foreground/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !jobRole}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 mt-4 text-lg"
          >
            {loading ? 'Initializing AI...' : 'Start Interview Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
