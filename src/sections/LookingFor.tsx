import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Coffee, Server, Layers, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const DEFAULT_ROLES_TO_FIND: any[] = [];

const getRoleDetails = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('software')) {
    return {
      title: `${title} Roles`,
      icon: <Code className="w-6 h-6 text-[#6366F1]" />,
      description: "Designing efficient algorithms, optimizing complex workflows, and solving customer-facing product issues.",
      glow: "rgba(99, 102, 241, 0.15)"
    };
  }
  if (t.includes('java')) {
    return {
      title: `${title} Roles`,
      icon: <Coffee className="w-6 h-6 text-[#EC9C30]" />,
      description: "Developing robust enterprise application backends, managing JVM performance, and scripting clean object-oriented architectures.",
      glow: "rgba(236, 156, 48, 0.15)"
    };
  }
  if (t.includes('backend') || t.includes('database') || t.includes('server')) {
    return {
      title: `${title} Roles`,
      icon: <Server className="w-6 h-6 text-[#10B981]" />,
      description: "Creating secure REST APIs, designing schema structures, caching database queries, and securing server logic.",
      glow: "rgba(16, 185, 129, 0.15)"
    };
  }
  return {
    title: `${title} Roles`,
    icon: <Layers className="w-6 h-6 text-[#8B5CF6]" />,
    description: "Connecting interactive user interfaces to scalable backends, working across React, FastAPI, Node, and databases.",
    glow: "rgba(139, 92, 246, 0.15)"
  };
};

export const LookingFor: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role_titles')
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0 && data[0].role_titles && data[0].role_titles.length > 0) {
          const mapped = data[0].role_titles.map((title: string) => getRoleDetails(title));
          setRoles(mapped);
        } else {
          setRoles(DEFAULT_ROLES_TO_FIND);
        }
      } catch (err) {
        console.error("Failed to fetch looking for roles:", err);
        setRoles(DEFAULT_ROLES_TO_FIND);
      }
    };
    fetchRoles();
  }, []);

  return (
    <section id="looking-for" className="py-20 relative overflow-hidden bg-[#0B0F19]/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="Currently Looking For"
          subtitle="I am actively searching for opportunities where I can apply my skills and build high-quality software."
          badge="Opportunities"
        />

        {roles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {roles.map((role, idx) => (
              <GlassCard
                key={role.title}
                glowColor={role.glow}
                delay={idx * 0.1}
                className="flex flex-col p-6 h-full border border-white/5 hover:border-white/10"
              >
                <div className="p-3.5 bg-white/3 border border-white/5 rounded-xl w-fit mb-5">
                  {role.icon}
                </div>
                <h3 className="text-lg font-bold font-display text-white mb-3">
                  {role.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  {role.description}
                </p>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-12">
            <p className="text-xs text-text-muted font-sans italic">No active role opportunities configured in profile.</p>
          </div>
        )}

        {/* Short status card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border border-[#6366F1]/20 bg-[#6366F1]/5 backdrop-blur-sm max-w-3xl mx-auto gap-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span className="text-xs font-semibold tracking-wide text-[#F8FAFC]">
              Open to full-time roles, software engineering internships, and freelance projects globally.
            </span>
          </div>
          <button
            onClick={() => {
              const element = document.getElementById('contact');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2.5 rounded-xl shadow-md transition-colors whitespace-nowrap cursor-pointer"
          >
            Get In Touch
          </button>
        </motion.div>
      </div>
    </section>
  );
};
