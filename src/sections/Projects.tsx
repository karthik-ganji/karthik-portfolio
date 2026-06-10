import React, { useState, useEffect } from 'react';
import { ExternalLink, Activity, Map, BarChart2 } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

interface Project {
  title: string;
  description: string;
  github: string;
  liveDemo?: string;
  image?: string;
  technologies: string[];
  metrics: string[];
}

const GithubIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const renderProjectVisual = (imageUrl: string | undefined, title: string) => {
  if (imageUrl && imageUrl.startsWith('http')) {
    return (
      <div className="w-full h-full min-h-[220px] relative bg-[#0F172A]/50 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }

  const tag = title.toLowerCase();
  
  if (tag.includes('geovaluator') || tag.includes('geospatial') || imageUrl === 'geovaluator') {
    return (
      <div className="w-full h-48 sm:h-64 relative bg-[#0F172A]/50 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
        <Map className="w-16 h-16 text-primary opacity-20 absolute" />
        
        {/* Custom GIS Coordinates Map Grid SVG */}
        <svg className="w-full h-full text-indigo-500/20" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20 H190 M10 40 H190 M10 60 H190 M10 80 H190" stroke="currentColor" strokeWidth="0.5" />
          <path d="M40 10 V90 M80 10 V90 M120 10 V90 M160 10 V90" stroke="currentColor" strokeWidth="0.5" />
          
          {/* Custom Contour lines */}
          <path d="M30 30 C 60 20, 120 80, 170 50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M20 50 C 70 80, 140 10, 180 30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Risk nodes */}
          <circle cx="80" cy="40" r="4" fill="#6366F1" fillOpacity="0.6" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="80" cy="40" r="3" fill="#6366F1" />
          
          <circle cx="140" cy="60" r="4" fill="#8B5CF6" fillOpacity="0.6" className="animate-ping" style={{ animationDuration: '4s' }} />
          <circle cx="140" cy="60" r="3" fill="#8B5CF6" />
        </svg>
        <div className="absolute bottom-3 right-3 text-[10px] tracking-wider font-semibold uppercase text-text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded">
          GIS Dashboard
        </div>
      </div>
    );
  }

  if (tag.includes('customer') || tag.includes('segmentation') || imageUrl === 'customer-analytics') {
    return (
      <div className="w-full h-48 sm:h-64 relative bg-[#0F172A]/50 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent pointer-events-none" />
        <BarChart2 className="w-16 h-16 text-accent opacity-20 absolute" />
        
        {/* Custom Clusters SVG */}
        <svg className="w-full h-full text-purple-500/20" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="45" cy="35" r="3" fill="#F59E0B" />
          <circle cx="55" cy="25" r="3.5" fill="#F59E0B" />
          <circle cx="65" cy="40" r="2.5" fill="#F59E0B" />
          <circle cx="50" cy="45" r="3" fill="#F59E0B" />
          
          <circle cx="120" cy="65" r="3.5" fill="#6366F1" />
          <circle cx="130" cy="75" r="2.5" fill="#6366F1" />
          <circle cx="140" cy="55" r="3" fill="#6366F1" />
          <circle cx="115" cy="50" r="4" fill="#6366F1" />
          
          <path d="M10 90 L190 10" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
        <div className="absolute bottom-3 right-3 text-[10px] tracking-wider font-semibold uppercase text-text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded">
          K-Means Clusters
        </div>
      </div>
    );
  }

  if (tag.includes('heart') || tag.includes('disease') || imageUrl === 'heart-disease') {
    return (
      <div className="w-full h-48 sm:h-64 relative bg-[#0F172A]/50 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-transparent pointer-events-none" />
        <Activity className="w-16 h-16 text-rose-500 opacity-20 absolute" />
        
        {/* Custom ECG Line SVG */}
        <svg className="w-full h-full text-rose-500/20" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 50 H60 L65 35 L70 65 L75 50 H95 L98 25 L103 80 L108 50 H130 L135 40 L140 60 L145 50 H190"
            stroke="#F43F5E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[dash_5s_linear_infinite]"
            strokeDasharray="400"
            strokeDashoffset="400"
          />
        </svg>
        <style>{`
          @keyframes dash {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
        <div className="absolute bottom-3 right-3 text-[10px] tracking-wider font-semibold uppercase text-text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded">
          Clinical Signal
        </div>
      </div>
    );
  }

  // General coding backup visual
  return (
    <div className="w-full h-48 sm:h-64 relative bg-[#0F172A]/50 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
      <svg className="w-full h-full text-indigo-500/10" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="25" width="140" height="50" rx="8" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M50 45 L90 45 M50 55 L120 55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="145" cy="50" r="10" stroke="currentColor" strokeWidth="1" />
        <path d="M145 45 L145 55 M140 50 L150 50" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="absolute bottom-3 right-3 text-[10px] tracking-wider font-semibold uppercase text-text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded">
        Code Repository
      </div>
    </div>
  );
};

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('projects')
          .select('title, description, github_url, live_demo_url, image_url, technologies, metrics')
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Re-map to match Project schema (github_url map, image_url map)
          const formatted: Project[] = data.map(p => ({
            title: p.title,
            description: p.description || '',
            github: p.github_url,
            liveDemo: p.live_demo_url || undefined,
            image: p.image_url || '',
            technologies: p.technologies || [],
            metrics: p.metrics || []
          }));
          setProjects(formatted);
        } else {
          setProjects([]);
        }
      } catch (err: any) {
        console.error("Supabase projects fetch failed:", err);
        setError(`Supabase connection failed: ${err.message || 'Check database connectivity.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="Featured Projects"
          subtitle="A selection of machine learning applications, backend APIs, and geospatial systems I have developed."
          badge="Portfolio"
        />

        {loading ? (
          <div className="space-y-10">
            {[1, 2].map(n => (
              <div key={n} className="h-64 bg-white/3 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-400 font-sans text-xs text-center backdrop-blur-sm">
            <h4 className="font-bold text-sm text-rose-300 mb-1">Projects Sync Terminated</h4>
            <p className="text-text-muted leading-relaxed font-semibold">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="max-w-md mx-auto py-16 px-6 rounded-2xl border border-dashed border-white/10 text-center font-sans text-xs bg-white/2">
            <p className="text-text-muted leading-relaxed font-semibold">No projects available yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {projects.map((project, index) => (
              <GlassCard
                key={project.title}
                delay={index * 0.1}
                className="border border-white/5 bg-[#0F172A]/30 p-0"
                glowColor={index % 2 === 0 ? "rgba(99, 102, 241, 0.12)" : "rgba(139, 92, 246, 0.12)"}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                  
                  {/* Visual half */}
                  <div className="lg:col-span-5 h-full">
                    {renderProjectVisual(project.image, project.title)}
                  </div>

                  {/* Content half */}
                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-display text-white mb-3 hover:text-primary transition-colors text-left">
                        {project.title}
                      </h3>
                      
                      <p className="text-sm text-text-muted leading-relaxed font-sans mb-6 text-left">
                        {project.description}
                      </p>

                      {/* Metrics grid */}
                      {project.metrics && project.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {project.metrics.map((metric) => (
                            <div
                              key={metric}
                              className="flex items-center gap-2 text-xs text-[#F8FAFC] bg-white/5 border border-white/5 rounded-xl px-4 py-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="font-sans font-semibold">{metric}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Tech Stacks Tag list */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-white/3 border border-white/5 px-2.5 py-1 rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="primary"
                          asAnchor
                          href={project.github}
                          target="_blank"
                          icon={<GithubIcon size={14} />}
                          className="text-xs py-2.5 px-4"
                        >
                          GitHub
                        </Button>

                        {project.liveDemo && (
                          <Button
                            variant="secondary"
                            asAnchor
                            href={project.liveDemo}
                            target="_blank"
                            icon={<ExternalLink size={14} />}
                            className="text-xs py-2.5 px-4"
                          >
                            Live Demo
                          </Button>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
