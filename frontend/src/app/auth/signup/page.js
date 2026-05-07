'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import PasswordStrength from '@/components/PasswordStrength';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value) error = 'Name is required';
      else if (value.length < 2) error = 'Name must be at least 2 characters';
    }
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email address';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 8) error = 'Min 8 characters';
      else if (!/[A-Z]/.test(value)) error = 'Need one uppercase letter';
      else if (!/[0-9]/.test(value)) error = 'Need one number';
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const isFormValid = 
    formData.name.length >= 2 && 
    /\S+@\S+\.\S+/.test(formData.email) && 
    formData.password.length >= 8 &&
    /[A-Z]/.test(formData.password) &&
    /[0-9]/.test(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/auth/signup', formData);
      Cookies.set('token', res.data.token, { expires: 7, path: '/' });
      window.location.href = '/dashboard';
    } catch (err) {
      setServerError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (name) => {
    const base = "w-full bg-input/50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ";
    if (!touched[name]) return base + "border-border focus:ring-primary/50";
    return base + (errors[name] 
      ? "border-red-500 focus:ring-red-500/20" 
      : "border-green-500 focus:ring-green-500/20");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-background">
      <div className="glass-card w-full max-w-md p-8 rounded-[32px] border border-border/50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2 tracking-tight">Create Account</h2>
          <p className="text-foreground/60 text-sm font-medium">Join thousands of successful candidates</p>
        </div>
        

        {serverError && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-500/20 flex items-center gap-3">
            <AlertCircle size={18} /> {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-1.5 ml-1">Full Name</label>
            <input 
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass('name')}
              placeholder="John Doe"
            />
            {touched.name && errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-1.5 ml-1">Email Address</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass('email')}
              placeholder="you@example.com"
            />
            {touched.email && errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('password')}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <PasswordStrength password={formData.password} />
          </div>

          <button 
            type="submit" 
            disabled={!isFormValid || loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:grayscale mt-6 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={24} /> Creating Account...</> : 'Sign Up Free'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-foreground/60 mt-8">
          Already have an account? <Link href="/auth/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
