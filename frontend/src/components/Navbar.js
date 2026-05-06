'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, LayoutDashboard, Sparkles, Menu, X } from 'lucide-react';
import Cookies from 'js-cookie';

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get('token'));
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    window.location.href = '/auth/login';
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight z-50">
          <Sparkles className="w-6 h-6 text-primary" />
          <span>InterviewAI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground flex items-center gap-2 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-400 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Log In
              </Link>
              <Link href="/auth/signup" className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 text-foreground/80 hover:text-foreground z-50 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 md:hidden flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in duration-200">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-bold flex items-center gap-3"
                >
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-2xl font-bold text-red-500 flex items-center gap-3"
                >
                  <LogOut className="w-6 h-6" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-bold"
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/signup" 
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl text-2xl font-bold shadow-xl shadow-primary/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
