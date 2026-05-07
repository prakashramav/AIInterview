'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-card p-12 rounded-[40px] border border-border shadow-2xl max-w-lg">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tight">Something went wrong</h2>
        <p className="text-foreground/60 mb-10 leading-relaxed font-medium">
          We encountered an unexpected error. Don't worry, it's not your fault. 
          Please try again or head back to safety.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="bg-secondary text-foreground px-8 py-4 rounded-2xl font-bold hover:bg-secondary/80 transition-all border border-border"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
