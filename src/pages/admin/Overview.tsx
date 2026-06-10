import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen, Code, MessageSquare, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

interface OverviewProps {
  setActiveTab: (tab: any) => void;
}

interface MessagePreview {
  id: number;
  name: string;
  email: string;
  subject: string;
  created_at: string;
  is_read: boolean;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    messages: 0,
    resume: false,
    profile: false,
  });
  const [recentMessages, setRecentMessages] = useState<MessagePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsCount, skillsCount, messagesCount, profileRes] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('skills').select('*', { count: 'exact', head: true }),
          supabase.from('messages').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('resume_url, name').limit(1).single()
        ]);

        const recentMsgs = await supabase
          .from('messages')
          .select('id, name, email, subject, created_at, is_read')
          .order('created_at', { ascending: false })
          .limit(3);

        setStats({
          projects: projectsCount.count || 0,
          skills: skillsCount.count || 0,
          messages: messagesCount.count || 0,
          resume: Boolean(profileRes.data?.resume_url),
          profile: Boolean(profileRes.data?.name),
        });

        if (recentMsgs.data) {
          setRecentMessages(recentMsgs.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Projects",
      value: stats.projects,
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      tab: 'projects',
      glow: "rgba(99, 102, 241, 0.12)"
    },
    {
      label: "Total Skills",
      value: stats.skills,
      icon: <Code className="w-5 h-5 text-accent" />,
      tab: 'skills',
      glow: "rgba(139, 92, 246, 0.12)"
    },
    {
      label: "Inbox Messages",
      value: stats.messages,
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      tab: 'messages',
      glow: "rgba(16, 185, 129, 0.12)"
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white/3 rounded-2xl border border-white/5" />
          <div className="h-32 bg-white/3 rounded-2xl border border-white/5" />
          <div className="h-32 bg-white/3 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Dashboard Overview</h1>
        <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Monitor website traffic, message inputs, and system statuses.</p>
      </div>

      {/* Grid of metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <GlassCard
            key={card.label}
            className="p-5 flex flex-col justify-between border border-white/5 bg-white/2 cursor-pointer hover:border-white/10"
            glowColor={card.glow}
            onClick={() => setActiveTab(card.tab)}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                {card.icon}
              </div>
              <span className="text-[10px] uppercase font-bold text-text-muted hover:text-white flex items-center gap-1 font-sans">
                Manage <ArrowRight size={10} />
              </span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white font-display block">
                {card.value}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                {card.label}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Overview Status Details and Inbox Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Status panel */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.1)">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 font-display">System Integrity</h3>
            <div className="space-y-4">
              {/* Profile Config */}
              <div className="flex items-center justify-between p-3.5 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-xs font-semibold text-text-muted font-sans">Admin Profile Info</span>
                <div className="flex items-center gap-1.5">
                  {stats.profile ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-xs text-white font-medium">Configured</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-rose-400" />
                      <span className="text-xs text-text-muted font-medium">Incomplete</span>
                    </>
                  )}
                </div>
              </div>

              {/* Resume File */}
              <div className="flex items-center justify-between p-3.5 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-xs font-semibold text-text-muted font-sans">Resume PDF Status</span>
                <div className="flex items-center gap-1.5">
                  {stats.resume ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-xs text-white font-medium">Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-rose-400" />
                      <span className="text-xs text-text-muted font-medium">Missing</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Message preview panel */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(139, 92, 246, 0.1)">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">Recent Contact Messages</h3>
              <button
                onClick={() => setActiveTab('messages')}
                className="text-[10px] uppercase font-bold text-primary hover:text-white flex items-center gap-1 cursor-pointer font-sans"
              >
                Inbox <ArrowRight size={10} />
              </button>
            </div>

            {recentMessages.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/5 rounded-xl font-sans">
                <p className="text-xs text-text-muted">No messages in inbox.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setActiveTab('messages')}
                    className={`p-3.5 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 transition-all cursor-pointer flex justify-between items-center ${!msg.is_read ? 'border-primary/20 bg-primary/2' : ''}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white font-display">{msg.name}</span>
                        {!msg.is_read && (
                          <span className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">New</span>
                        )}
                      </div>
                      <span className="text-xs text-text-muted font-semibold font-sans line-clamp-1">{msg.subject || 'No Subject'}</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-sans font-semibold">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
