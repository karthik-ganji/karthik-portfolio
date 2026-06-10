import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Code2, Lock, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabase';

const navItems = [
  { name: 'Home', id: 'home' },
  { name: 'About', id: 'about' },
  { name: 'Skills', id: 'skills' },
  { name: 'Projects', id: 'projects' },
  { name: 'GitHub', id: 'github' },
  { name: 'DSA', id: 'dsa' },
  { name: 'Experience', id: 'experience' },
  { name: 'Education', id: 'education' },
  { name: 'Contact', id: 'contact' },
];

export const Navbar: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check initial authentication
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const role = session.user.user_metadata?.role || session.user.app_metadata?.role;
          setIsAdmin(role === 'admin');
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Failed to check auth in Navbar", err);
      }
    };
    checkAuth();

    // Listen for auth state alterations
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        const role = session.user.user_metadata?.role || session.user.app_metadata?.role;
        setIsAdmin(role === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Offset scroll to account for fixed navbar height (approx 80px)
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav shadow-lg' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="p-2 rounded-lg bg-gradient-to-tr from-primary to-accent">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              KG<span className="text-primary font-normal">.</span>
            </span>
          </div>

          {/* Desktop & Mobile Actions bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-3.5 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-300 ${activeSection === item.id ? 'text-white' : 'text-text-muted hover:text-white'}`}
                >
                  {item.name}
                  {activeSection === item.id && (
                    <motion.div
                      className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-gradient-to-r from-primary to-accent"
                      layoutId="activeNavIndicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Admin Login/Dashboard Button */}
            <div className="flex items-center">
              {isAdmin ? (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="px-3.5 py-2 rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/20 text-[10px] font-bold uppercase tracking-wider text-white transition-all select-none cursor-pointer flex items-center gap-1.5"
                  title="Go to Dashboard"
                >
                  <LayoutDashboard size={12} className="text-primary animate-pulse" />
                  <span>Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/admin/login'}
                  className="p-2 sm:p-2.5 rounded-xl border border-white/5 bg-white/3 hover:bg-white/8 text-text-muted hover:text-white transition-all select-none cursor-pointer flex items-center justify-center"
                  title="Admin Login"
                >
                  <Lock size={12} />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass-nav border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === item.id ? 'bg-gradient-to-r from-primary/10 to-accent/10 text-white border-l-2 border-primary pl-3' : 'text-text-muted hover:text-white hover:bg-white/5 pl-4'}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
