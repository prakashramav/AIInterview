'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      Cookies.set('token', res.data.token, { expires: 7, path: '/' });
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(true);
    } catch (err) {
      setError('Could not process request. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-background">
      <div className="glass-card w-full max-w-md p-8 rounded-[32px] border border-border/50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-foreground/60 text-sm font-medium">Log in to continue your journey</p>
        </div>

        
        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        
        {!showForgot ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="relative">
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-black uppercase tracking-widest text-foreground/40">Password</label>
                <button 
                  type="button" 
                  onClick={() => setShowForgot(true)}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all disabled:opacity-50 mt-6 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" size={24} /> Logging in...</> : 'Log In'}
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {forgotSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Check your inbox</h3>
                <p className="text-foreground/60 text-sm mb-6">We've sent reset instructions to {forgotEmail}</p>
                <button 
                  onClick={() => setShowForgot(false)}
                  className="text-primary font-bold hover:underline"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <h3 className="text-xl font-bold mb-2">Reset Password</h3>
                <p className="text-foreground/60 text-sm mb-6">Enter your email and we'll send you a link to reset your password.</p>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-1.5 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={forgotLoading}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <><Loader2 className="animate-spin" size={24} /> Sending...</> : 'Send Reset Link'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForgot(false)}
                  className="w-full text-sm font-bold text-foreground/40 hover:text-foreground transition-colors py-2"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-sm font-medium text-foreground/60 mt-8">
          Don't have an account? <Link href="/auth/signup" className="text-primary font-bold hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
