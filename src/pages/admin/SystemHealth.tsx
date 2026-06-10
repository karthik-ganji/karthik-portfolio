import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  CheckCircle, XCircle, AlertCircle, RefreshCw, Database, 
  Key, ShieldCheck, FileText, Image, MessageSquare, Server 
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

interface HealthCheckItem {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  icon: React.ReactNode;
}

export const SystemHealth: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [envCheck, setEnvCheck] = useState<HealthCheckItem>({
    name: 'Environment Variables Loaded',
    status: 'loading',
    message: 'Checking environment variables...',
    icon: <Key className="w-5 h-5 text-indigo-400" />
  });
  const [dbCheck, setDbCheck] = useState<HealthCheckItem>({
    name: 'Database Connection',
    status: 'loading',
    message: 'Testing database tables connection...',
    icon: <Database className="w-5 h-5 text-cyan-400" />
  });
  const [authCheck, setAuthCheck] = useState<HealthCheckItem>({
    name: 'Authentication Status',
    status: 'loading',
    message: 'Checking auth session & roles...',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
  });
  const [storageCheck, setStorageCheck] = useState<HealthCheckItem>({
    name: 'Storage Access',
    status: 'loading',
    message: 'Testing portfolio-assets bucket listing...',
    icon: <Server className="w-5 h-5 text-purple-400" />
  });
  const [resumeCheck, setResumeCheck] = useState<HealthCheckItem>({
    name: 'Resume File Status',
    status: 'loading',
    message: 'Checking database resume_url...',
    icon: <FileText className="w-5 h-5 text-amber-400" />
  });
  const [avatarCheck, setAvatarCheck] = useState<HealthCheckItem>({
    name: 'Profile Photo Status',
    status: 'loading',
    message: 'Checking database avatar_url...',
    icon: <Image className="w-5 h-5 text-rose-400" />
  });
  const [messagesCheck, setMessagesCheck] = useState<HealthCheckItem>({
    name: 'Messages Table Connection',
    status: 'loading',
    message: 'Checking access to contact messages...',
    icon: <MessageSquare className="w-5 h-5 text-blue-400" />
  });

  const performHealthChecks = async () => {
    setChecking(true);

    // 1. Env check
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!isSupabaseConfigured) {
      setEnvCheck({
        name: 'Environment Variables Loaded',
        status: 'error',
        message: !hasUrl || !hasKey 
          ? 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env.' 
          : 'Supabase credentials contain placeholders.',
        icon: <Key className="w-5 h-5 text-rose-400" />
      });
      setDbCheck({
        name: 'Database Connection',
        status: 'error',
        message: 'Database check skipped (Supabase client unconfigured).',
        icon: <Database className="w-5 h-5 text-rose-400" />
      });
      setAuthCheck({
        name: 'Authentication Status',
        status: 'error',
        message: 'Auth check skipped (Supabase client unconfigured).',
        icon: <ShieldCheck className="w-5 h-5 text-rose-400" />
      });
      setStorageCheck({
        name: 'Storage Access',
        status: 'error',
        message: 'Storage check skipped (Supabase client unconfigured).',
        icon: <Server className="w-5 h-5 text-rose-400" />
      });
      setResumeCheck({
        name: 'Resume File Status',
        status: 'error',
        message: 'Resume check skipped (Supabase client unconfigured).',
        icon: <FileText className="w-5 h-5 text-rose-400" />
      });
      setAvatarCheck({
        name: 'Profile Photo Status',
        status: 'error',
        message: 'Profile photo check skipped (Supabase client unconfigured).',
        icon: <Image className="w-5 h-5 text-rose-400" />
      });
      setMessagesCheck({
        name: 'Messages Table Connection',
        status: 'error',
        message: 'Messages check skipped (Supabase client unconfigured).',
        icon: <MessageSquare className="w-5 h-5 text-rose-400" />
      });
      setChecking(false);
      return;
    }

    setEnvCheck({
      name: 'Environment Variables Loaded',
      status: 'success',
      message: `Configured. URL: ${import.meta.env.VITE_SUPABASE_URL}`,
      icon: <Key className="w-5 h-5 text-emerald-400" />
    });

    // 2. Auth Check
    try {
      const { data: { session }, error: authErr } = await supabase.auth.getSession();
      if (authErr) throw authErr;
      if (session && session.user) {
        const role = session.user.user_metadata?.role || session.user.app_metadata?.role;
        if (role === 'admin') {
          setAuthCheck({
            name: 'Authentication Status',
            status: 'success',
            message: `Logged in as Admin: ${session.user.email}`,
            icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
          });
        } else {
          setAuthCheck({
            name: 'Authentication Status',
            status: 'error',
            message: `Logged in, but metadata role is "${role}" instead of "admin".`,
            icon: <ShieldCheck className="w-5 h-5 text-rose-400" />
          });
        }
      } else {
        setAuthCheck({
          name: 'Authentication Status',
          status: 'error',
          message: 'No active session found.',
          icon: <ShieldCheck className="w-5 h-5 text-rose-400" />
        });
      }
    } catch (err: any) {
      setAuthCheck({
        name: 'Authentication Status',
        status: 'error',
        message: `Session lookup failed: ${err.message || err}`,
        icon: <ShieldCheck className="w-5 h-5 text-rose-400" />
      });
    }

    // Fetch profile table records to test db connection, profile details, resume, avatar
    let profileData: any = null;
    try {
      const { data, error: dbErr } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (dbErr) throw dbErr;
      
      setDbCheck({
        name: 'Database Connection',
        status: 'success',
        message: 'Successfully queried profiles table.',
        icon: <Database className="w-5 h-5 text-emerald-400" />
      });

      if (data && data.length > 0) {
        profileData = data[0];
        
        // Resume check
        if (profileData.resume_url) {
          setResumeCheck({
            name: 'Resume File Status',
            status: 'success',
            message: `Active resume: ${profileData.resume_url.substring(0, 45)}...`,
            icon: <FileText className="w-5 h-5 text-emerald-400" />
          });
        } else {
          setResumeCheck({
            name: 'Resume File Status',
            status: 'error',
            message: 'No resume URL saved in profiles.',
            icon: <FileText className="w-5 h-5 text-amber-400" />
          });
        }

        // Avatar check
        if (profileData.avatar_url) {
          setAvatarCheck({
            name: 'Profile Photo Status',
            status: 'success',
            message: `Active avatar: ${profileData.avatar_url.substring(0, 45)}...`,
            icon: <Image className="w-5 h-5 text-emerald-400" />
          });
        } else {
          setAvatarCheck({
            name: 'Profile Photo Status',
            status: 'error',
            message: 'No avatar URL saved in profiles.',
            icon: <Image className="w-5 h-5 text-rose-400" />
          });
        }

      } else {
        setResumeCheck({
          name: 'Resume File Status',
          status: 'error',
          message: 'No profile records exist in database.',
          icon: <FileText className="w-5 h-5 text-amber-400" />
        });
        setAvatarCheck({
          name: 'Profile Photo Status',
          status: 'error',
          message: 'No profile records exist in database.',
          icon: <Image className="w-5 h-5 text-rose-400" />
        });
      }
    } catch (err: any) {
      setDbCheck({
        name: 'Database Connection',
        status: 'error',
        message: `Failed to query profiles table: ${err.message || err}`,
        icon: <Database className="w-5 h-5 text-rose-400" />
      });
      setResumeCheck({
        name: 'Resume File Status',
        status: 'error',
        message: 'Database profiles connection error.',
        icon: <FileText className="w-5 h-5 text-rose-400" />
      });
      setAvatarCheck({
        name: 'Profile Photo Status',
        status: 'error',
        message: 'Database profiles connection error.',
        icon: <Image className="w-5 h-5 text-rose-400" />
      });
    }

    // 3. Storage check
    try {
      const { error: storageErr } = await supabase.storage
        .from('portfolio-assets')
        .list('', { limit: 1 });

      if (storageErr) throw storageErr;

      setStorageCheck({
        name: 'Storage Access',
        status: 'success',
        message: 'Successfully list files inside "portfolio-assets" bucket.',
        icon: <Server className="w-5 h-5 text-emerald-400" />
      });
    } catch (err: any) {
      setStorageCheck({
        name: 'Storage Access',
        status: 'error',
        message: `Bucket check failed: ${err.message || 'portfolio-assets bucket missing or private.'}`,
        icon: <Server className="w-5 h-5 text-rose-400" />
      });
    }

    // 4. Messages Check
    try {
      const { error: msgErr } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      if (msgErr) throw msgErr;

      setMessagesCheck({
        name: 'Messages Table Connection',
        status: 'success',
        message: 'Successfully queried messages table schema.',
        icon: <MessageSquare className="w-5 h-5 text-emerald-400" />
      });
    } catch (err: any) {
      setMessagesCheck({
        name: 'Messages Table Connection',
        status: 'error',
        message: `Messages table connection error: ${err.message || err}`,
        icon: <MessageSquare className="w-5 h-5 text-rose-400" />
      });
    }

    setChecking(false);
  };

  useEffect(() => {
    performHealthChecks();
  }, []);

  const items = [
    envCheck,
    dbCheck,
    authCheck,
    storageCheck,
    resumeCheck,
    avatarCheck,
    messagesCheck
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">System Diagnostics</h1>
          <p className="text-xs text-text-muted mt-1 font-sans font-semibold">
            Real-time status check of Supabase database collections, authentication configurations, and media storage pipelines.
          </p>
        </div>
        <Button
          onClick={performHealthChecks}
          disabled={checking}
          variant="secondary"
          icon={<RefreshCw size={14} className={checking ? 'animate-spin' : ''} />}
          className="w-full sm:w-auto text-xs py-3 px-6 shrink-0"
        >
          {checking ? 'Analyzing...' : 'Run Diagnostics'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
        {items.map((item, idx) => (
          <GlassCard key={idx} className="p-5 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.08)">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/3 border border-white/5 shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white font-display truncate">{item.name}</h4>
                  
                  {item.status === 'loading' && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                  )}
                  {item.status === 'success' && (
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  )}
                  {item.status === 'error' && (
                    <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-text-muted break-words leading-relaxed font-semibold">
                  {item.message}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Troubleshooting guide */}
      <GlassCard className="p-6 border border-white/5 bg-white/3" glowColor="rgba(99, 102, 241, 0.05)">
        <div className="flex gap-4">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs font-sans font-semibold">
            <h4 className="font-bold text-white text-sm">Need Help Troubleshooting?</h4>
            <p className="text-text-muted leading-relaxed">
              If items are showing errors, verify that you have executed the complete migration code inside <code>supabase_schema.sql</code>, created the storage bucket, and filled the required keys in the local <code>.env</code> file. Check <code>SETUP.md</code> for step-by-step guidance.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
