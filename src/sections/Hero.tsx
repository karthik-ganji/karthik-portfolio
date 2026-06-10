import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Download, Mail, ChevronDown } from 'lucide-react';
import { Button } from '../components/Button';
import { SocialLinks } from '../components/SocialLinks';
import { supabase } from '../lib/supabase';

const DEFAULT_ROLES: string[] = [];

export const Hero: React.FC = () => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [profile, setProfile] = useState<any>({
    name: '',
    tagline: '',
    avatar_url: '',
    resume_url: '',
    role_titles: [] as string[]
  });
  const [imgFailed, setImgFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImgFailed(false);
  }, [profile.avatar_url]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('name, tagline, avatar_url, resume_url, role_titles')
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setProfile({
            ...data[0],
            role_titles: data[0].role_titles || []
          });
          setError(null);
        } else {
          setError("Profiles table is empty. Please set up your professional biography details in the Admin Dashboard.");
        }
      } catch (err: any) {
        console.error("Supabase profile fetch failed", err);
        setError(`Supabase connection failed: ${err.message || 'Check database connectivity.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const activeRoles = profile.role_titles && profile.role_titles.length > 0
    ? profile.role_titles
    : DEFAULT_ROLES;

  useEffect(() => {
    if (activeRoles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % activeRoles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeRoles.length]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen relative flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Decorative Blur Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] md:w-[450px] h-[300px] md:h-[450px] bg-accent/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
            {loading ? (
              <div className="w-full max-w-xl space-y-5 animate-pulse py-4 flex flex-col items-center lg:items-start">
                <div className="h-6 w-40 bg-white/5 rounded-full" />
                <div className="h-16 w-full max-w-md bg-white/5 rounded-2xl" />
                <div className="h-8 w-60 bg-white/5 rounded-lg" />
                <div className="h-24 w-full bg-white/5 rounded-2xl" />
                <div className="h-12 w-full max-w-xs bg-white/5 rounded-xl" />
              </div>
            ) : error ? (
              <div className="w-full max-w-xl p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-400 font-sans text-xs text-left mb-6 flex flex-col gap-2 backdrop-blur-sm">
                <div className="font-bold text-sm text-rose-300">Profile Loading Interrupted</div>
                <p className="text-text-muted text-[11px] leading-relaxed font-semibold">{error}</p>
                <div className="mt-2 flex gap-3">
                  <a href="/admin/login" className="text-primary hover:underline font-bold">Sign In Admin</a>
                </div>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  Available for Full-time & Internships
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                  className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-display mb-4"
                >
                  Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#a5b4fc] to-accent">{profile.name}</span>
                </motion.h1>

                {/* Rotating Title */}
                {activeRoles.length > 0 && (
                  <div className="h-12 sm:h-16 flex items-center mb-6">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentRoleIndex}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                        className="text-xl sm:text-3xl font-semibold text-white/90 font-sans tracking-wide"
                      >
                        {activeRoles[currentRoleIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                  className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl mb-8 font-sans"
                >
                  {profile.tagline}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                  className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8"
                >
                  <Button
                    variant="primary"
                    onClick={() => handleScrollTo('projects')}
                    icon={<ArrowRight size={16} />}
                    className="w-full sm:w-auto text-sm"
                  >
                    View Projects
                  </Button>
                  
                  {/* Hide Resume button if resume_url is not defined/uploaded */}
                  {profile.resume_url && (
                    <Button
                      variant="secondary"
                      asAnchor
                      href={profile.resume_url}
                      target="_blank"
                      icon={<Download size={16} />}
                      className="w-full sm:w-auto text-sm"
                    >
                      Download Resume
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleScrollTo('contact')}
                    icon={<Mail size={16} />}
                    className="w-full sm:w-auto text-sm border-white/10 hover:border-white/20"
                  >
                    Contact Me
                  </Button>
                </motion.div>

                {/* Social Accounts */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <SocialLinks />
                </motion.div>
              </>
            )}
          </div>

          {/* Right Column: Avatar Representation */}
          <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
            >
              {/* Spinning glow ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-primary/20 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-dashed border-accent/20 animate-[spin_40s_linear_infinite_reverse]" />
              
              {/* Main Avatar Circle */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-primary/10 to-accent/10 border border-white/10 backdrop-blur-sm overflow-hidden flex items-center justify-center shadow-2xl">
                {/* Dynamically loads avatar_url from Supabase, else falls back to local /profile.jpg, else SVG vector */}
                {!imgFailed && (profile.avatar_url || profile.avatar_url === '') && (
                  <img
                    src={profile.avatar_url || "/profile.jpg"}
                    alt="Karthik Ganji"
                    className="w-full h-full object-cover"
                    onError={() => setImgFailed(true)}
                  />
                )}
                
                {imgFailed && (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0F172A]/40 text-primary"
                  >
                    <svg className="w-24 h-24 sm:w-32 sm:h-32 text-indigo-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="40" r="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M20 80C20 65 32 58 50 58C68 58 80 65 80 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <rect x="35" y="32" width="30" height="16" rx="8" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M42 40L47 43L58 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-text-muted bg-white/5 border border-white/10 px-3 py-1 rounded-md">
                      &lt; Karthik /&gt;
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer text-text-muted hover:text-white transition-colors"
          onClick={() => handleScrollTo('looking-for')}
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
