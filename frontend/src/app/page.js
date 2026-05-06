'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Mic, BarChart, CheckCircle2, User, Zap, Lock } from 'lucide-react';

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background text-foreground relative overflow-hidden pb-20">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/30 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]" 
        />
      </div>

      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-5xl px-6 text-center z-10 flex flex-col items-center pt-32 pb-20"
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          AI English Coach v2.0 is live
        </motion.div>
        
        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 leading-tight">
          Master Technical Interviews <br className="hidden md:block" /> & English Fluency
        </motion.h1>
        
        <motion.p variants={fadeUp} className="text-lg md:text-xl text-foreground/60 max-w-2xl mb-10 leading-relaxed">
          The all-in-one platform to land your dream job. Adaptive technical interviews combined with a 
          <strong> 60-Day AI English Communication Program</strong>.
        </motion.p>
        
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-24">
          <Link href="/auth/signup" className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95">
            Start Free Interview 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/coach/lessons" className="group flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-semibold hover:bg-foreground/90 transition-all shadow-lg hover:scale-105 active:scale-95">
            Join 60-Day English Program
            <Zap size={20} className="text-primary fill-primary" />
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full"
        >
          <FeatureCard 
            icon={<BrainCircuit className="text-primary w-8 h-8" />}
            title="Adaptive Teacher"
            description="Our AI Coach reacts to your specific mistakes and simplifies explanations just like a real human mentor."
          />
          <FeatureCard 
            icon={<Mic className="text-purple-500 w-8 h-8" />}
            title="Voice-First Learning"
            description="No typing. Speak naturally with your female Indian AI teacher and get instant pronunciation feedback."
          />
          <FeatureCard 
            icon={<BarChart className="text-green-500 w-8 h-8" />}
            title="60-Day Roadmap"
            description="A structured curriculum from Beginner to Advanced, designed to make you interview-ready in 2 months."
          />
        </motion.div>
      </motion.div>

      {/* AI English Program Preview */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="w-full max-w-5xl px-6 py-20 rounded-[40px] bg-gradient-to-b from-primary/5 to-transparent border border-primary/10 relative overflow-hidden mb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Your Personal <span className="text-primary">Indian English</span> Coach</h2>
            <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
              Experience the world's most adaptive English learning system. Our AI teacher identifies your grammar patterns, provides real-time corrections, and helps you build professional confidence.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                <CheckCircle2 size={18} className="text-primary" /> 12-Step State-Based Conversational Lessons
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                <CheckCircle2 size={18} className="text-primary" /> Realistic Indian English Female Persona
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                <CheckCircle2 size={18} className="text-primary" /> Grammar & Pronunciation Analysis
              </li>
            </ul>
            <Link href="/coach/start" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-black text-sm hover:scale-105 transition-all shadow-xl shadow-primary/20">
              Start Practice Session Now <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-full bg-primary/10 animate-pulse absolute inset-0 blur-3xl" />
            <div className="glass-card p-8 rounded-[32px] border-2 border-primary/20 relative z-20 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-xl">1</div>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Step</p>
                  <p className="font-black text-lg">Greetings & Professional Intro</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-xs font-bold text-primary mb-1 uppercase">AI Teacher</p>
                  <p className="text-sm italic">"Hmm... nice try! beta. You can say: 'I have 5 years of experience.' instead of 'I am having...'. Let's try again?"</p>
                </div>
                <div className="bg-foreground/5 p-4 rounded-2xl border border-border">
                  <p className="text-xs font-bold text-foreground/40 mb-1 uppercase">User</p>
                  <p className="text-sm italic">"Okay, I have five years of experience in React..."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="w-full max-w-5xl px-6 py-20"
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Stories from our Loved Community</h2>
          <p className="text-foreground/60 text-lg">Real success stories from engineers who transformed their careers with us.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TestimonialCard 
            quote="I was always afraid of technical rounds. The AI Interviewer's feedback on my React concepts was exactly what I needed to clear my final round at TCS."
            author="Priyanka K."
            role="Software Engineer"
          />
          <TestimonialCard 
            quote="The English Coach feels like a real mentor. She corrected my local phrasing and helped me speak clearly during my UK client calls."
            author="Arjun M."
            role="SDE @ Amazon"
          />
          <TestimonialCard 
            quote="The 60-day roadmap is so structured! I went from basic greetings to explaining complex architecture with total confidence."
            author="Sneha P."
            role="Data Scientist"
          />
        </div>
      </motion.div>

      {/* Pricing Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="w-full max-w-5xl px-6 py-20 border-y border-border"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Simple, transparent pricing</h2>
          <p className="text-foreground/60 text-lg">Start for free, upgrade when you're ready to dominate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="glass-card p-8 rounded-[32px] border border-border flex flex-col">
            <h3 className="text-xl font-bold mb-2">Basic</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">$0</span>
              <span className="text-foreground/40">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm text-foreground/60"><CheckCircle2 size={16} className="text-primary" /> 2 Technical Interviews / mo</li>
              <li className="flex items-center gap-2 text-sm text-foreground/60"><CheckCircle2 size={16} className="text-primary" /> 5 AI Coach Sessions / mo</li>
              <li className="flex items-center gap-2 text-sm text-foreground/60"><CheckCircle2 size={16} className="text-primary" /> Basic Grammar Analysis</li>
            </ul>
            <Link href="/auth/signup" className="w-full py-4 rounded-2xl border border-border font-bold text-center hover:bg-foreground/5 transition-all">Get Started</Link>
          </div>

          {/* Pro Tier */}
          <div className="glass-card p-8 rounded-[32px] border-2 border-primary bg-primary/5 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded-full uppercase">Most Popular</div>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">$29</span>
              <span className="text-foreground/40">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm font-bold text-foreground/80"><CheckCircle2 size={16} className="text-primary" /> Unlimited Technical Interviews</li>
              <li className="flex items-center gap-2 text-sm font-bold text-foreground/80"><CheckCircle2 size={16} className="text-primary" /> Full 60-Day English Program</li>
              <li className="flex items-center gap-2 text-sm font-bold text-foreground/80"><CheckCircle2 size={16} className="text-primary" /> Advanced Pronunciation Coaching</li>
              <li className="flex items-center gap-2 text-sm font-bold text-foreground/80"><CheckCircle2 size={16} className="text-primary" /> Priority Gemini 2.0 Access</li>
            </ul>
            <Link href="/auth/signup" className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">Go Pro Now</Link>
          </div>
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="text-center py-32"
      >
        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">Ready to land your dream job?</h2>
        <Link href="/auth/signup" className="bg-primary text-primary-foreground px-12 py-6 rounded-full font-black text-xl hover:scale-110 transition-all shadow-2xl shadow-primary/20 inline-block">
          Start Your Journey Free
        </Link>
      </motion.div>

      {/* Footer */}
      <footer className="w-full max-w-5xl px-6 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-black text-xl">
            <Zap className="text-primary fill-primary" size={20} />
            InterviewAI
          </div>
          <p className="text-sm text-foreground/40">© 2026 InterviewAI Inc. All rights reserved.</p>
        </div>
        <div className="flex gap-8 text-sm font-bold text-foreground/40">
          <Link href="#" className="hover:text-primary">Privacy</Link>
          <Link href="#" className="hover:text-primary">Terms</Link>
          <Link href="#" className="hover:text-primary">Contact</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      whileHover={{ y: -5 }}
      className="glass-card p-8 rounded-3xl flex flex-col gap-4 border border-border/50 bg-card/40 hover:bg-card/60 transition-colors shadow-sm"
    >
      <div className="p-3 bg-background/80 rounded-2xl w-fit shadow-sm border border-border/50">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-foreground/60 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
      }}
      className="glass-card p-8 rounded-[32px] border border-border italic relative hover:border-primary/30 transition-all"
    >
      <p className="text-foreground/80 mb-6 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3 not-italic">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20">
          {author[0]}
        </div>
        <div>
          <p className="text-sm font-black">{author}</p>
          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

function StepCard({ number, icon, title, description }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
      }}
      className="flex flex-col items-center text-center relative"
    >
      <div className="w-24 h-24 rounded-full bg-background border-4 border-border flex items-center justify-center mb-6 relative shadow-lg">
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-md">
          {number}
        </div>
        <div className="text-primary">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/60">{description}</p>
    </motion.div>
  );
}
