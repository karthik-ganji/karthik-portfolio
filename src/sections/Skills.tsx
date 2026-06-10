import React, { useState, useEffect } from 'react';
import { Terminal, Layout, Server, Database, Settings, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface SkillCategory {
  category: string;
  skills: string[];
}

const categoryMeta: Record<string, { icon: React.ReactNode; glow: string; colorClass: string }> = {
  "Programming Languages": {
    icon: <Terminal className="w-5 h-5 text-indigo-400" />,
    glow: "rgba(99, 102, 241, 0.15)",
    colorClass: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5"
  },
  "Frontend": {
    icon: <Layout className="w-5 h-5 text-violet-400" />,
    glow: "rgba(139, 92, 246, 0.15)",
    colorClass: "border-violet-500/20 text-violet-400 bg-violet-500/5"
  },
  "Backend": {
    icon: <Server className="w-5 h-5 text-emerald-400" />,
    glow: "rgba(16, 185, 129, 0.15)",
    colorClass: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
  },
  "Databases": {
    icon: <Database className="w-5 h-5 text-amber-400" />,
    glow: "rgba(245, 158, 11, 0.15)",
    colorClass: "border-amber-500/20 text-amber-400 bg-amber-500/5"
  },
  "Tools": {
    icon: <Settings className="w-5 h-5 text-rose-400" />,
    glow: "rgba(244, 63, 94, 0.15)",
    colorClass: "border-rose-500/20 text-rose-400 bg-rose-500/5"
  }
};

export const Skills: React.FC = () => {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('skills')
          .select('name, category')
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Group database rows by category
          const grouped: Record<string, string[]> = {};
          
          // Pre-populate keys in desired order
          const order = ["Programming Languages", "Frontend", "Backend", "Databases", "Tools"];
          order.forEach(cat => grouped[cat] = []);

          data.forEach((row) => {
            const cat = row.category;
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(row.name);
          });

          // Convert grouped object to array format
          const formatted: SkillCategory[] = Object.keys(grouped)
            .filter(cat => grouped[cat].length > 0)
            .map((cat) => ({
              category: cat,
              skills: grouped[cat],
            }));

          setCategories(formatted);
        } else {
          setCategories([]);
        }
      } catch (err: any) {
        console.error("Supabase skills fetch failed:", err);
        setError(`Supabase connection failed: ${err.message || 'Check database connectivity.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return (
    <section id="skills" className="py-20 relative overflow-hidden bg-[#0B0F19]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="Skills & Expertise"
          subtitle="My technical stack divided by category. Designed for robust application design and modern integration models."
          badge="Technologies"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-white/3 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-400 font-sans text-xs text-center backdrop-blur-sm">
            <h4 className="font-bold text-sm text-rose-300 mb-1">Skills Loading Blocked</h4>
            <p className="text-text-muted leading-relaxed font-semibold">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="max-w-md mx-auto py-12 px-6 rounded-2xl border border-dashed border-white/10 text-center font-sans text-xs bg-white/2">
            <p className="text-text-muted leading-relaxed font-semibold">No skills configured in database yet. Add technical categories from the Admin console.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((categoryGroup, index) => {
              const meta = categoryMeta[categoryGroup.category] || {
                icon: <ShieldCheck className="w-5 h-5 text-primary" />,
                glow: "rgba(99, 102, 241, 0.15)",
                colorClass: "border-primary/20 text-primary bg-primary/5"
              };

              return (
                <GlassCard
                  key={categoryGroup.category}
                  glowColor={meta.glow}
                  delay={index * 0.1}
                  className="p-6 h-full flex flex-col justify-between border border-white/5 bg-white/2"
                >
                  <div>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-6 text-left">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        {meta.icon}
                      </div>
                      <h3 className="text-lg font-bold font-display text-white">
                        {categoryGroup.category}
                      </h3>
                    </div>

                    {/* Skills List */}
                    <div className="flex flex-wrap gap-2.5">
                      {categoryGroup.skills.map((skill) => (
                        <div
                          key={skill}
                          className={`flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-300 hover:scale-[1.03] ${meta.colorClass}`}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
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
