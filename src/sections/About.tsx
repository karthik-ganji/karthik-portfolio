import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Briefcase, Code, GraduationCap } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface CounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
}

const Counter: React.FC<CounterProps> = ({ value, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = value;
    const duration = 1500;
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = progress * (2 - progress);
      const current = easeProgress * (end - start) + start;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-display font-extrabold text-3xl sm:text-4xl text-white">
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export const About: React.FC = () => {
  const [bio, setBio] = useState("");
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutAndStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch bio
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('about_me')
          .limit(1);

        if (profileErr) throw profileErr;
        
        if (profiles && profiles.length > 0 && profiles[0].about_me) {
          setBio(profiles[0].about_me);
        } else {
          setBio("Biographical summary has not been configured in the database yet.");
        }

        // Fetch metrics counts dynamically
        const [projRes, skillRes, expRes, eduRes] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('skills').select('*', { count: 'exact', head: true }),
          supabase.from('experience').select('*', { count: 'exact', head: true }),
          supabase.from('education').select('metric').ilike('degree', '%bachelor%').limit(1)
        ]);

        if (projRes.error) throw projRes.error;
        if (skillRes.error) throw skillRes.error;
        if (expRes.error) throw expRes.error;

        // Extract BTech CGPA score dynamically (expected metric: "CGPA: 7.8" or "7.8")
        let cgpa = 0.0;
        if (!eduRes.error && eduRes.data && eduRes.data.length > 0 && eduRes.data[0].metric) {
          const match = eduRes.data[0].metric.match(/[\d.]+/);
          if (match) {
            cgpa = parseFloat(match[0]);
          }
        }

        setStats([
          { label: "Projects Completed", value: projRes.count || 0, suffix: "+", decimals: 0, icon: <Code className="w-5 h-5 text-primary" /> },
          { label: "Experiences", value: expRes.count || 0, suffix: "", decimals: 0, icon: <Briefcase className="w-5 h-5 text-accent" /> },
          { label: "Technologies", value: skillRes.count || 0, suffix: "+", decimals: 0, icon: <Award className="w-5 h-5 text-indigo-400" /> },
          { label: "B.Tech CGPA", value: cgpa, suffix: "", decimals: 1, icon: <GraduationCap className="w-5 h-5 text-purple-400" /> }
        ]);

      } catch (err: any) {
        console.error("About metrics fetch failed:", err);
        setError(`Database access failed: ${err.message || 'Check connection'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutAndStats();
  }, []);

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="About Me"
          subtitle="My professional background, interests, and key metrics."
          badge="Profile"
        />

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 animate-pulse">
              <div className="h-6 w-full bg-white/5 rounded-lg" />
              <div className="h-6 w-11/12 bg-white/5 rounded-lg" />
              <div className="h-6 w-10/12 bg-white/5 rounded-lg" />
              <div className="h-6.5 w-full bg-white/5 rounded-lg" />
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-32 bg-white/3 border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-400 font-sans text-xs text-center backdrop-blur-sm">
            <h4 className="font-bold text-sm text-rose-300 mb-1">About Info Sync Failure</h4>
            <p className="text-text-muted leading-relaxed font-semibold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Block: Bio Paragraphs */}
            <motion.div
              className="lg:col-span-7 space-y-6 text-sm sm:text-base text-text-muted leading-relaxed font-sans text-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="whitespace-pre-line text-left">
                {bio}
              </p>
            </motion.div>

            {/* Right Block: Stats Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <GlassCard
                  key={stat.label}
                  className="p-5 flex flex-col justify-between border border-white/5 bg-white/2"
                  delay={index * 0.1}
                >
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 w-fit mb-4">
                    {stat.icon}
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {stat.label}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
