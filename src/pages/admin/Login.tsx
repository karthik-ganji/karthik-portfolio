import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Lock, Mail, AlertCircle, LogIn, Code2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { CanvasParticles } from '../../components/CanvasParticles';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in with admin role
  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const role = session.user.user_metadata?.role || session.user.app_metadata?.role;
          if (role === 'admin') {
            navigate('/admin');
          }
        }
      } catch (err) {
        console.error("Session check failed", err);
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Task 1 & 2: Audit Supabase config before fetching
    if (!isSupabaseConfigured) {
      setError('Supabase connection parameters are missing. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data?.session) {
        const user = data.session.user;
        const role = user.user_metadata?.role || user.app_metadata?.role;
        
        // Task 3: Implement dynamic role verification
        if (role === 'admin') {
          navigate('/admin');
        } else {
          // Immediately sign out unauthorized accounts to clear local storage tokens
          await supabase.auth.signOut();
          setError('Access Denied. Your account does not have the "admin" metadata role.');
        }
      }
    } catch (err: any) {
      console.error("Login failure:", err);
      
      // Task 2: Display exact, user-friendly descriptive error messages
      let errMsg = err.message || 'Authentication failed.';
      const lowerMsg = errMsg.toLowerCase();

      if (lowerMsg.includes('failed to fetch')) {
        // Find configuration reason
        const url = import.meta.env.VITE_SUPABASE_URL || '';
        if (!url) {
          errMsg = 'Supabase URL is missing from environment configurations (.env).';
        } else if (url.includes('placeholder')) {
          errMsg = 'Supabase URL is configured with placeholder values. Please update your .env file.';
        } else {
          errMsg = 'Network connection failed. Please check your internet connection and verify that your Supabase project is active.';
        }
      } else if (lowerMsg.includes('invalid login credentials')) {
        errMsg = 'Incorrect email address or password. Please verify your entries.';
      } else if (lowerMsg.includes('email not confirmed')) {
        errMsg = 'Your email address is not yet confirmed. Please verify your email inbox first.';
      } else if (lowerMsg.includes('user not found')) {
        errMsg = 'No user account registered with this email address.';
      } else if (lowerMsg.includes('network')) {
        errMsg = 'A database network timeout occurred. Please retry in a few moments.';
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0B0F19]">
      <CanvasParticles />
      
      {/* Glow Backplate */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-[100px] -z-10 animate-pulse-slow" />

      <GlassCard className="w-full max-w-md p-8 border border-white/5 bg-[#0F172A]/40" glowColor="rgba(99, 102, 241, 0.15)">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-primary to-accent rounded-2xl mb-4">
            <Code2 className="w-6 h-6 text-white animate-[pulse_2s_infinite]" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Portfolio Admin</h1>
          <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Sign in to manage your system</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-2.5 text-xs text-amber-400 font-sans font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Warning:</strong> Supabase client is unconfigured. Login requests will fail until you configure a <code>.env</code> file.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-2.5 text-xs text-rose-400 font-sans font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted font-display" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-muted" />
              <input
                id="email"
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans transition-all"
                placeholder="your-admin-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted font-display" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-muted" />
              <input
                id="password"
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full h-12 mt-6 justify-center text-sm font-semibold"
            icon={<LogIn size={16} />}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
