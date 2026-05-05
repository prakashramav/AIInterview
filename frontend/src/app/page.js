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
          InterviewAI v1.0 is live
        </motion.div>
        
        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 leading-tight">
          Master Your Next <br className="hidden md:block" /> Technical Interview
        </motion.h1>
        
        <motion.p variants={fadeUp} className="text-lg md:text-xl text-foreground/60 max-w-2xl mb-10 leading-relaxed">
          AI-powered mock interviews that adapt to your role and experience. 
          Get real-time feedback, improve your communication skills, and land your dream job.
        </motion.p>
        
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-24">
          <Link href="/auth/signup" className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95">
            Start Free Interview 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
            title="Adaptive AI"
            description="Questions dynamically change based on your previous answers, mimicking a real interview environment."
          />
          <FeatureCard 
            icon={<Mic className="text-purple-500 w-8 h-8" />}
            title="Voice Integration"
            description="Practice speaking your answers out loud. We analyze your tone and delivery."
          />
          <FeatureCard 
            icon={<BarChart className="text-green-500 w-8 h-8" />}
            title="Detailed Feedback"
            description="Get actionable insights, a score out of 10, and ideal example answers to improve instantly."
          />
        </motion.div>
      </motion.div>

      {/* How it Works Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="w-full max-w-5xl px-6 py-20 border-t border-border mt-10"
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-foreground/60 text-lg">Three simple steps to interview readiness.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />
          
          <StepCard 
            number="1"
            icon={<User size={24} />}
            title="Set Your Role"
            description="Select your target job title and experience level (e.g. Senior React Developer)."
          />
          <StepCard 
            number="2"
            icon={<Zap size={24} />}
            title="Start Mock Interview"
            description="Answer realistic, adaptive questions generated by our advanced AI interviewer."
          />
          <StepCard 
            number="3"
            icon={<CheckCircle2 size={24} />}
            title="Review Feedback"
            description="Get a comprehensive breakdown of your strengths, weaknesses, and a final score."
          />
        </div>
      </motion.div>
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
