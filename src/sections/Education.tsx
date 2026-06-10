import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, BookOpen } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface EducationItem {
  degree: string;
  field: string;
  institution: string;
  metric: string;
}

export const Education: React.FC = () => {
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('education')
          .select('degree, field, institution, metric')
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setEducationList(data);
        } else {
          setEducationList([]);
        }
      } catch (err: any) {
        console.error("Supabase education fetch failed:", err);
        setError(`Supabase connection failed: ${err.message || 'Check database connectivity.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, []);

  return (
    <section id="education" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="Education"
          subtitle="My academic credentials and technical diplomas."
          badge="Academics"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[1, 2].map(n => (
              <div key={n} className="h-56 bg-white/3 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-400 font-sans text-xs text-center backdrop-blur-sm">
            <h4 className="font-bold text-sm text-rose-300 mb-1">Education Sync Blocked</h4>
            <p className="text-text-muted leading-relaxed font-semibold">{error}</p>
          </div>
        ) : educationList.length === 0 ? (
          <div className="max-w-md mx-auto py-12 px-6 rounded-2xl border border-dashed border-white/10 text-center font-sans text-xs bg-white/2">
            <p className="text-text-muted leading-relaxed font-semibold">No academic credentials configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {educationList.map((item, index) => {
              const isBtech = item.degree.toLowerCase().includes("bachelor") || item.degree.toLowerCase().includes("b.tech");

              return (
                <GlassCard
                  key={item.degree}
                  delay={index * 0.15}
                  className="p-6 border border-white/5 bg-[#0F172A]/20 flex flex-col justify-between h-56"
                  glowColor={isBtech ? "rgba(99, 102, 241, 0.12)" : "rgba(139, 92, 246, 0.12)"}
                >
                  <div>
                    {/* Card Header Icon */}
                    <div className="flex items-center justify-between mb-4 text-left">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 w-fit">
                        <GraduationCap className={`w-5 h-5 ${isBtech ? 'text-primary' : 'text-accent'}`} />
                      </div>
                      
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-white/5 border border-white/5 px-2.5 py-0.5 rounded">
                        {isBtech ? "Undergraduate" : "Diploma"}
                      </span>
                    </div>

                    {/* Degree Titles */}
                    <h3 className="text-base sm:text-lg font-bold font-display text-white mb-1 text-left">
                      {item.degree}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-4 font-sans font-semibold text-left">
                      <BookOpen size={12} className="text-text-muted" />
                      <span>{item.field}</span>
                    </div>

                    <p className="text-xs text-text-muted font-sans truncate text-left">
                      {item.institution}
                    </p>
                  </div>

                  {/* Score badge at the bottom */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#F8FAFC] font-semibold font-sans text-left">
                    <Award size={14} className={isBtech ? 'text-primary' : 'text-accent'} />
                    <span>Academic Standing: <strong>{item.metric}</strong></span>
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
