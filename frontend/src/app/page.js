'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Brain, 
  Mic, 
  CalendarDays, 
  CheckCircle2, 
  User, 
  Zap, 
  Lock,
  Star,
  Quote
} from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-start bg-background text-foreground relative overflow-x-hidden pb-10 md:pb-20">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[40%] h-[40%] rounded-full bg-primary/30 blur-[80px] md:blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[-10%] w-[60%] md:w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[80px] md:blur-[120px]" 
        />
      </div>

      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="w-full max-w-5xl px-4 md:px-6 text-center z-10 flex flex-col items-center pt-20 md:pt-32 pb-16 md:pb-20"
      >
        <motion.div 
          variants={fadeUp} 
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: ["0 0 0px rgba(var(--primary), 0)", "0 0 20px rgba(var(--primary), 0.2)", "0 0 0px rgba(var(--primary), 0)"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs md:text-sm font-medium mb-6 md:mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          AI English Coach v2.0 is live
        </motion.div>
        
        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 leading-[1.1] md:leading-tight">
          Master Technical Interviews <br className="hidden sm:block" /> & English Fluency
        </motion.h1>
        
        <motion.p variants={fadeUp} className="text-base md:text-xl text-foreground/60 max-w-2xl mb-8 md:mb-10 leading-relaxed px-4 md:px-0">
          The all-in-one platform to land your dream job. Adaptive technical interviews combined with a 
          <strong className="text-foreground/80"> 60-Day AI English Communication Program</strong>.
        </motion.p>
        
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-8 w-full sm:w-auto px-6 sm:px-0">
          <Link href="/auth/signup" className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95">
            Start Free Interview 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/coach/lessons" className="group flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-semibold hover:bg-foreground/90 transition-all shadow-lg hover:scale-105 active:scale-95">
            Join 60-Day Program
            <Zap size={20} className="text-primary fill-primary" />
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-16 md:mb-24">
          <Link href="/demo" className="text-foreground/60 hover:text-primary font-medium flex items-center gap-2 transition-all group border-b border-transparent hover:border-primary pb-1">
            Try a free demo — no signup needed
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Browser Mockup */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 40, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, delay: 0.4 } }
          }}
          className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/50 p-2 md:p-3"
        >
          <div className="bg-background rounded-xl overflow-hidden border border-border/50">
            {/* Browser Header */}
            <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
              </div>
              <div className="mx-auto bg-background/50 px-8 py-1 rounded-md text-[10px] text-foreground/40 font-medium">
                interviewai.com/coach/start
              </div>
            </div>
            {/* Screenshot */}
            <div className="aspect-[16/10] relative">
              <Image 
                src="/product-shot.png" 
                alt="InterviewAI Coach Interface" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Bar */}
      <div className="w-full border-y border-border/50 bg-card/30 backdrop-blur-sm py-8 md:py-12 my-12 md:my-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatItem value={500} suffix="+" label="Interviews completed" />
          <StatItem value={60} suffix="-day" label="Structured program" />
          <StatItem value={2} suffix=".0" label="Gemini Powered" />
        </div>
      </div>

      {/* Features Grid */}
      <motion.div 
        id="features"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="w-full max-w-5xl px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-left scroll-mt-20"
      >
        <FeatureCard 
          icon={<Brain className="text-primary w-8 h-8" />}
          title="Adaptive Teacher"
          description="Our AI Coach reacts to your specific mistakes and simplifies explanations just like a real human mentor."
        />
        <FeatureCard 
          icon={<Mic className="text-purple-500 w-8 h-8" />}
          title="Voice-First Learning"
          description="No typing. Speak naturally with your female Indian AI teacher and get instant pronunciation feedback."
        />
        <FeatureCard 
          icon={<CalendarDays className="text-green-500 w-8 h-8" />}
          title="60-Day Roadmap"
          description="A structured curriculum from Beginner to Advanced, designed to make you interview-ready in 2 months."
        />
      </motion.div>

      {/* ... rest of the content (Testimonials, etc.) ... */}
      <TestimonialsSection />

      {/* Pricing and Footer remain same, but I'll include them for completeness in the final file */}
      <PricingSection />
      
      <footer className="w-full max-w-6xl px-6 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 mt-20">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2 font-black text-xl">
            <Zap className="text-primary fill-primary" size={20} />
            InterviewAI
          </div>
          <p className="text-xs md:text-sm text-foreground/40">© 2026 InterviewAI Inc. All rights reserved.</p>
        </div>
        <div className="flex gap-6 md:gap-8 text-xs md:text-sm font-bold text-foreground/40">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, suffix, label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime;
      const duration = 2000;
      
      const animateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * value));
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      
      requestAnimationFrame(animateCount);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-5xl font-black mb-2 text-primary">
        {count}{suffix}
      </div>
      <div className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-foreground/40">
        {label}
      </div>
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
      whileHover={{ scale: 1.02 }}
      className="group glass-card p-8 rounded-3xl flex flex-col gap-4 border border-border/50 bg-card/40 hover:border-primary/50 transition-all shadow-sm"
    >
      <div className="p-3 bg-background/80 rounded-2xl w-fit shadow-sm border border-border/50 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-foreground/60 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}

function TestimonialsSection() {
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full max-w-5xl px-4 md:px-6 py-16 md:py-20"
    >
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Loved by our Community</h2>
        <p className="text-foreground/60 text-base md:text-lg max-w-2xl mx-auto font-medium">Real success stories from engineers who transformed their careers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <TestimonialCard 
          quote="I was always afraid of technical rounds. The AI Interviewer's feedback was exactly what I needed."
          author="Priyanka K."
          role="Software Engineer"
          company="Google"
          rating={5}
          color="bg-blue-500"
        />
        <TestimonialCard 
          quote="The English Coach feels like a real mentor. She corrected my local phrasing and helped me speak clearly."
          author="Arjun M."
          role="SDE"
          company="Amazon"
          rating={5}
          color="bg-purple-500"
        />
        <TestimonialCard 
          quote="The 60-day roadmap is so structured! I went from basic greetings to complex architecture discussions."
          author="Sneha P."
          role="Data Scientist"
          company="Microsoft"
          rating={5}
          color="bg-green-500"
        />
        <TestimonialCard 
          quote="As a remote developer, my communication was the bottleneck. InterviewAI fixed that in weeks."
          author="Rahul S."
          role="Frontend Lead"
          company="Meta"
          rating={5}
          color="bg-orange-500"
        />
      </div>
    </motion.div>
  );
}

function TestimonialCard({ quote, author, role, company, rating, color }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
      }}
      className="glass-card p-6 rounded-[28px] border-l-[3px] border-l-primary border-t border-r border-b border-border/50 relative hover:border-primary/30 transition-all flex flex-col group"
    >
      <div className="mb-4">
        <Quote className="text-primary/20 w-8 h-8 -ml-2 mb-2" />
        <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">"{quote}"</p>
      </div>
      
      <div className="mt-auto pt-4 flex flex-col gap-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-foreground/10"} />
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${color}/10 border border-${color}/20 flex items-center justify-center font-black text-xs text-foreground`}>
            {author.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-xs font-black">{author}</p>
            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{role} @ {company}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PricingSection() {
  return (
    <motion.div 
      id="pricing"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full max-w-5xl px-4 md:px-6 py-16 md:py-20 border-y border-border scroll-mt-20"
    >
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Simple, transparent pricing</h2>
        <p className="text-foreground/60 text-base md:text-lg font-medium">Start for free, upgrade when you're ready to dominate.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div className="glass-card p-8 rounded-[32px] border border-border flex flex-col">
          <h3 className="text-xl font-bold mb-2">Basic</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black">$0</span>
            <span className="text-sm text-foreground/40">/month</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-2 text-sm text-foreground/60 font-medium"><CheckCircle2 size={16} className="text-primary" /> 2 Technical Interviews / mo</li>
            <li className="flex items-center gap-2 text-sm text-foreground/60 font-medium"><CheckCircle2 size={16} className="text-primary" /> 5 AI Coach Sessions / mo</li>
          </ul>
          <Link href="/auth/signup" className="w-full py-4 rounded-2xl border border-border font-bold text-center hover:bg-foreground/5 transition-all">Get Started</Link>
        </div>

        <div className="glass-card p-8 rounded-[32px] border-2 border-primary bg-primary/5 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded-full uppercase">Most Popular</div>
          <h3 className="text-xl font-bold mb-2">Pro</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black">$29</span>
            <span className="text-sm text-foreground/40">/month</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-2 text-sm font-bold text-foreground/80"><CheckCircle2 size={16} className="text-primary" /> Unlimited Technical Interviews</li>
            <li className="flex items-center gap-2 text-sm font-bold text-foreground/80"><CheckCircle2 size={16} className="text-primary" /> Full 60-Day English Program</li>
          </ul>
          <Link href="/auth/signup" className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">Go Pro Now</Link>
        </div>
      </div>
    </motion.div>
  );
}
