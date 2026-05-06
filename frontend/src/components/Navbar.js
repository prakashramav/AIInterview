'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, LayoutDashboard, Sparkles, BookOpen, UserCircle } from 'lucide-react';
import Cookies from 'js-cookie';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get('token'));
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
    window.location.href = '/auth/login';
  };

  const navLinks = isAuthenticated ? [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'English Coach', href: '/coach/lessons', icon: <BookOpen className="w-4 h-4" /> },
  ] : [
    { name: 'Features', href: '/#features', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Pricing', href: '/#pricing', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/signup';

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight z-[110]">
          <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            InterviewAI
          </span>
        </Link>
        
        {/* Desktop Navigation (lg and up) */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-6 pr-6 border-r border-border">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="text-sm font-semibold text-foreground/60 hover:text-foreground flex items-center gap-2 transition-all hover:translate-y-[-1px]"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-red-500 hover:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
              >
                Logout
              </button>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 ring-4 ring-primary/5">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {!isAuthPage && (
                <>
                  <Link href="/auth/login" className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors px-4 py-2">
                    Log In
                  </Link>
                  <Link href="/auth/signup" className="text-sm font-bold bg-primary text-primary-foreground px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile/Tablet Actions (below lg) */}
        <div className="flex lg:hidden items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-[10px] sm:text-xs font-bold bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95">
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-[10px] sm:text-xs font-bold text-red-500 bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/20 active:scale-95 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            !isAuthPage && (
              <Link href="/auth/signup" className="text-xs font-bold bg-primary text-primary-foreground px-5 py-2 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                Get Started
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
