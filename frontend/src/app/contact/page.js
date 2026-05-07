'use client';
import { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, Loader2, Mail, MessageSquare, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/contact`, formData);
      setSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Get in <span className="text-primary">Touch</span></h1>
          <p className="text-foreground/60 text-lg font-medium">Have questions? We're here to help you on your journey.</p>
        </div>

        <div className="glass-card p-8 md:p-12 rounded-[40px] border border-border shadow-2xl relative overflow-hidden">
          {success ? (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black mb-4">Message Sent!</h2>
              <p className="text-foreground/60 text-lg mb-8">Thank you for reaching out. Our team will get back to you shortly.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-primary font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/40 ml-1">
                    <User size={14} /> Full Name
                  </label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-input/50 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/40 ml-1">
                    <Mail size={14} /> Email Address
                  </label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-input/50 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/40 ml-1">
                  <MessageSquare size={14} /> Your Message
                </label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-input/50 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              {error && <p className="text-sm font-bold text-red-500 text-center">{error}</p>}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-5 rounded-[20px] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                {loading ? <><Loader2 className="animate-spin" /> Sending...</> : <><Send size={24} /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
