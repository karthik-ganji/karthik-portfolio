import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Building } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

export const Experience: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('experience')
          .select('company, role, duration, description')
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          // Map to match the schema (period vs duration)
          const formatted: ExperienceItem[] = data.map(item => ({
            role: item.role,
            company: item.company,
            period: item.duration,
            description: item.description || ''
          }));
          setExperiences(formatted);
        } else {
          setExperiences([]);
        }
      } catch (err: any) {
        console.error("Supabase experience fetch failed:", err);
        setError(`Supabase connection failed: ${err.message || 'Check database connectivity.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <section id="experience" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="Work Experience"
          subtitle="My professional history working as a developer and analyst in technical settings."
          badge="Timeline"
        />

        {loading ? (
          <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
            {[1, 2].map(n => (
              <div key={n} className="h-32 bg-white/3 border border-white/5 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-400 font-sans text-xs text-center backdrop-blur-sm">
            <h4 className="font-bold text-sm text-rose-300 mb-1">Experience Sync Failed</h4>
            <p className="text-text-muted leading-relaxed font-semibold">{error}</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="max-w-md mx-auto py-12 px-6 rounded-2xl border border-dashed border-white/10 text-center font-sans text-xs bg-white/2">
            <p className="text-text-muted leading-relaxed font-semibold">No experience entries configured yet.</p>
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical Center Track Line */}
            <div className="absolute left-4 md:left-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-accent to-transparent -translate-x-1/2" />

            <div className="flex flex-col gap-12">
              {experiences.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={item.role + item.company}
                    className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Timeline Glowing Node Dot */}
                    <div className="absolute left-4 md:left-1/2 w-4.5 h-4.5 rounded-full bg-[#0B0F19] border-2 border-primary -translate-x-1/2 top-1.5 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-20" />

                    {/* Spacer Column for Desktop Center Balance */}
                    <div className="hidden md:block w-1/2" />

                    {/* Card Content Column */}
                    <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8">
                      <motion.div
                        initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        <GlassCard
                          className="p-5 border border-white/5 bg-[#0F172A]/10 hover:border-primary/20"
                          glowColor={isEven ? "rgba(99, 102, 241, 0.1)" : "rgba(139, 92, 246, 0.1)"}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-3 text-left">
                            <span className="text-sm font-bold text-white font-display">
                              {item.role}
                            </span>
                            
                            <div className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 font-semibold font-sans">
                              <Calendar size={10} />
                              <span>{item.period}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-4 font-sans font-semibold text-left">
                            <Building size={12} className="text-accent" />
                            <span>{item.company}</span>
                          </div>

                          <p className="text-xs text-text-muted leading-relaxed font-sans text-left">
                            {item.description}
                          </p>
                        </GlassCard>
                      </motion.div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
