import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Brain, Terminal, Award } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface AchievementItem {
  title: string;
  description: string;
  category: string;
}

const iconMeta: Record<string, { icon: React.ReactNode; glow: string }> = {
  "3 Internships Completed": {
    icon: <Briefcase className="w-6 h-6 text-[#10B981]" />,
    glow: "rgba(16, 185, 129, 0.15)"
  },
  "B.Tech in Computer Science": {
    icon: <GraduationCap className="w-6 h-6 text-[#6366F1]" />,
    glow: "rgba(99, 102, 241, 0.15)"
  },
  "Machine Learning Projects": {
    icon: <Brain className="w-6 h-6 text-[#8B5CF6]" />,
    glow: "rgba(139, 92, 246, 0.15)"
  },
  "Full Stack Development": {
    icon: <Terminal className="w-6 h-6 text-[#EC9C30]" />,
    glow: "rgba(236, 156, 48, 0.15)"
  }
};

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('achievements')
          .select('title, description, category')
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setAchievements(data);
        } else {
          setAchievements([]);
        }
      } catch (err: any) {
        console.error("Supabase achievements fetch failed:", err);
        setError(`Supabase connection failed: ${err.message || 'Check database connectivity.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <section id="achievements" className="py-20 relative overflow-hidden bg-[#0B0F19]/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="Key Achievements"
          subtitle="A summary of my academic achievements, industrial internships, and core engineering milestones."
          badge="Highlights"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[1, 2].map(n => (
              <div key={n} className="h-32 bg-white/3 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-400 font-sans text-xs text-center backdrop-blur-sm">
            <h4 className="font-bold text-sm text-rose-300 mb-1">Achievements Sync Halted</h4>
            <p className="text-text-muted leading-relaxed font-semibold">{error}</p>
          </div>
        ) : achievements.length === 0 ? (
          <div className="max-w-md mx-auto py-12 px-6 rounded-2xl border border-dashed border-white/10 text-center font-sans text-xs bg-white/2">
            <p className="text-text-muted leading-relaxed font-semibold">No key achievements configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {achievements.map((item, idx) => {
              const meta = iconMeta[item.title] || {
                icon: <Award className="w-6 h-6 text-primary" />,
                glow: "rgba(99, 102, 241, 0.15)"
              };

              return (
                <GlassCard
                  key={item.title}
                  glowColor={meta.glow}
                  delay={idx * 0.1}
                  className="p-6 flex flex-col sm:flex-row gap-5 items-start border border-white/5 bg-white/2 h-full"
                >
                  <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl w-fit shrink-0">
                    {meta.icon}
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold font-display text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
