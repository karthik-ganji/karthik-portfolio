import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { Code, GitBranch, Cpu, ExternalLink } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

interface DynamicCounterProps {
  value: number;
}

const DynamicCounter: React.FC<DynamicCounterProps> = ({ value }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView || value <= 0) return;
    
    let start = 0;
    const end = value;
    const duration = 1200;
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

  return <span ref={ref}>{Math.floor(count)}</span>;
};

const topics = [
  {
    title: "Data Structures",
    icon: <GitBranch className="w-6 h-6 text-primary" />,
    description: "Designing efficient memory representations, utilizing Arrays, Linked Lists, Stacks, Queues, Trees, and Graphs.",
    glow: "rgba(99, 102, 241, 0.12)"
  },
  {
    title: "Algorithms",
    icon: <Cpu className="w-6 h-6 text-accent" />,
    description: "Analyzing asymptotic complexity, designing Search/Sort routines, Greedy schemas, Dynamic Programming, and Graph Traversals.",
    glow: "rgba(139, 92, 246, 0.12)"
  },
  {
    title: "Competitive Programming",
    icon: <Code className="w-6 h-6 text-emerald-400" />,
    description: "Participating in timed contests, debugging edge cases under strict CPU limits, and optimizing space complexities.",
    glow: "rgba(16, 185, 129, 0.12)"
  }
];

export const DSA: React.FC = () => {
  const [dsa, setDsa] = useState({
    leetcodeSolved: 0,
    hackerrankSolved: 0,
    leetcodeUrl: '',
    hackerrankUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDsaSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('settings')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          const dsaState = {
            leetcodeSolved: 0,
            hackerrankSolved: 0,
            leetcodeUrl: '',
            hackerrankUrl: '',
          };

          data.forEach((row) => {
            if (row.key === 'leetcode_solved') dsaState.leetcodeSolved = parseInt(row.value) || 0;
            if (row.key === 'hackerrank_solved') dsaState.hackerrankSolved = parseInt(row.value) || 0;
            if (row.key === 'leetcode_url') dsaState.leetcodeUrl = row.value;
            if (row.key === 'hackerrank_url') dsaState.hackerrankUrl = row.value;
          });

          setDsa(dsaState);
        } else {
          setDsa({
            leetcodeSolved: 0,
            hackerrankSolved: 0,
            leetcodeUrl: '',
            hackerrankUrl: '',
          });
        }
      } catch (err: any) {
        console.error("Supabase DSA settings fetch failed:", err);
        setError(`Supabase connection failed: ${err.message || 'Check database connectivity.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDsaSettings();
  }, []);

  const hasLeetcodeStats = dsa.leetcodeSolved > 0;
  const hasHackerrankStats = dsa.hackerrankSolved > 0;

  return (
    <section id="dsa" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="Problem Solving"
          subtitle="My skills in algorithm design and data structures. I enjoy solving complex logic puzzles on various platforms."
          badge="DSA & Competencies"
        />

        {/* Conceptual Focus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {topics.map((topic, index) => (
            <GlassCard
              key={topic.title}
              glowColor={topic.glow}
              delay={index * 0.1}
              className="p-6 flex flex-col justify-between border border-white/5 bg-white/2 h-full"
            >
              <div>
                <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl w-fit mb-5">
                  {topic.icon}
                </div>
                <h3 className="text-lg font-bold font-display text-white mb-3">
                  {topic.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  {topic.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Recruiter-focused platforms dashboard */}
        {/* Recruiter-focused platforms dashboard */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-pulse">
            {[1, 2].map(n => (
              <div key={n} className="h-40 bg-white/3 border border-white/5 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-400 font-sans text-xs text-center backdrop-blur-sm">
            <h4 className="font-bold text-sm text-rose-300 mb-1">DSA Stats Sync Halted</h4>
            <p className="text-text-muted leading-relaxed font-semibold">{error}</p>
          </div>
        ) : !dsa.leetcodeUrl && !dsa.hackerrankUrl ? (
          <div className="max-w-md mx-auto py-10 px-6 rounded-2xl border border-dashed border-white/10 text-center font-sans text-xs bg-white/2">
            <p className="text-text-muted leading-relaxed font-semibold">Competitive programming profiles are not yet linked.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* LeetCode Card */}
            {dsa.leetcodeUrl && (
              <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(239, 142, 22, 0.12)">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#EC9C30]">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.102 17.93l-2.697 2.607c-.466.483-1.211.504-1.683.044l-4.778-4.664a1.156 1.156 0 010-1.637l7.46-7.211c.466-.483 1.211-.504 1.683-.044l2.697 2.607c.466.482.443 1.237-.043 1.684l-4.483 4.15a.77.77 0 00-.01 1.096l4.52 4.385c.463.485.422 1.258-.07 1.678zm-6.277-2.61a.885.885 0 01-.01-1.25l4.507-4.354c.355-.34.338-.908-.035-1.229l-.27-.234a.903.903 0 00-1.207.034l-5.698 5.51a1.99 1.99 0 000 2.816l5.702 5.514a.903.903 0 001.206.034l.269-.234c.373-.321.39-.89.035-1.23l-4.5-4.36z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-bold font-display text-white">LeetCode</h4>
                      <p className="text-xs text-text-muted font-sans font-semibold">Active coding member</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-2.5">
                    {hasLeetcodeStats && (
                      <div className="text-center sm:text-right">
                        <span className="text-2xl font-extrabold text-[#F8FAFC]">
                          <DynamicCounter value={dsa.leetcodeSolved} />
                        </span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider block font-sans font-semibold">Problems Solved</span>
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      asAnchor
                      href={dsa.leetcodeUrl}
                      target="_blank"
                      icon={<ExternalLink size={12} />}
                      className="text-xs py-2 px-3 border-orange-500/10 hover:bg-orange-500/5 hover:text-white"
                    >
                      LeetCode Profile
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* HackerRank Card */}
            {dsa.hackerrankUrl && (
              <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(34, 197, 94, 0.12)">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#2EC866]">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm3.845 14.156l-3.845 2.146-3.845-2.146V9.845L12 7.699l3.845 2.146v6.311zM11.25 15.34l-2.095-1.168V11.83l2.095 1.168v2.342zm1.5 0v-2.342l2.095-1.168v2.342L12.75 15.34z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-bold font-display text-white">HackerRank</h4>
                      <p className="text-xs text-text-muted font-sans font-semibold">Gold badges in Problem Solving</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-2.5">
                    {hasHackerrankStats && (
                      <div className="text-center sm:text-right">
                        <span className="text-2xl font-extrabold text-[#F8FAFC]">
                          <DynamicCounter value={dsa.hackerrankSolved} />
                        </span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider block font-sans font-semibold">Problems Solved</span>
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      asAnchor
                      href={dsa.hackerrankUrl}
                      target="_blank"
                      icon={<ExternalLink size={12} />}
                      className="text-xs py-2 px-3 border-emerald-500/10 hover:bg-emerald-500/5 hover:text-white"
                    >
                      HackerRank Profile
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

          </div>
        )}
      </div>
    </section>
  );
};
