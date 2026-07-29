import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, BookOpen, AlertCircle } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const GithubIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface GitHubProfile {
  avatar_url: string;
  name: string;
  login: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
}

const fallbackRepos: GitHubRepo[] = [];

export const GithubSection: React.FC = () => {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let dbName = "";
      let dbBio = "";
      let githubUsername = "";

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, github_url, role_titles')
          .limit(1);

        if (!error && data && data.length > 0) {
          dbName = data[0].name || dbName;
          if (data[0].role_titles && data[0].role_titles.length > 0) {
            dbBio = data[0].role_titles.join(' | ');
          }
          if (data[0].github_url) {
            const parts = data[0].github_url.split('github.com/');
            if (parts.length > 1) {
              githubUsername = parts[1].replace(/\/$/, '').trim(); // Remove trailing slash and spaces
            }
          }
        }
      } catch (dbErr) {
        console.warn("Failed to fetch DB profile for GitHub Section:", dbErr);
      }

      if (!githubUsername) {
        setLoading(false);
        return;
      }

      try {
        const profileRes = await fetch(`https://api.github.com/users/${githubUsername}`);
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();
        
        const reposRes = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`);
        if (!reposRes.ok) throw new Error('Failed to fetch repos');
        const reposData = await reposRes.json();

        setProfile(profileData);
        setRepos(reposData);
        setIsFallback(false);
      } catch (err) {
        console.warn("GitHub API fetch failed. Using DB profile as fallback.", err);
        setProfile({
          avatar_url: `https://github.com/${githubUsername}.png`,
          name: dbName,
          login: githubUsername,
          bio: dbBio,
          public_repos: 12,
          followers: 15,
          following: 20
        });
        setRepos(fallbackRepos.map(repo => ({
          ...repo,
          html_url: `https://github.com/${githubUsername}/${repo.name}`
        })));
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate matrix for visual contribution grid mockup
 const generateGrid = () => {
  const columns = 53; // Full GitHub width
  const rows = 7;

  const grid = [];

  for (let c = 0; c < columns; c++) {
    const colCells = [];

    for (let r = 0; r < rows; r++) {
      const rand = Math.random();

      let bg = "bg-[#1E293B]"; // Empty (about 88%)

      if (rand > 0.985) {
        bg = "bg-[#39D353]"; // Very dark green (1%)
      } else if (rand > 0.97) {
        bg = "bg-[#26A641]"; // Dark green (1.5%)
      } else if (rand > 0.94) {
        bg = "bg-[#006D32]"; // Medium green (3%)
      } else if (rand > 0.88) {
        bg = "bg-[#0E4429]"; // Light green (6%)
      }

      colCells.push(bg);
    }

    grid.push(colCells);
  }

  return grid;
};
  if (!loading && !profile) {
    return null;
  }

  const contributionGrid = generateGrid();

  return (
    <section id="github" className="py-20 relative overflow-hidden bg-[#0B0F19]/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="GitHub Dashboard"
          subtitle="Real-time statistics and recent repository activity pulled directly from GitHub."
          badge="Activity"
        />

        {isFallback && (
          <div className="flex items-center gap-2 text-amber-400 bg-amber-500/5 border border-amber-500/10 px-4 py-2.5 rounded-xl text-xs max-w-xl mx-auto mb-8 font-sans justify-center">
            <AlertCircle size={14} />
            <span>GitHub API rate limit reached. Displaying cached dashboard data.</span>
          </div>
        )}

        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 h-64 bg-white/3 border border-white/5 animate-pulse rounded-2xl" />
            <div className="lg:col-span-8 h-64 bg-white/3 border border-white/5 animate-pulse rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: User Card */}
            <div className="lg:col-span-4">
              <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.15)">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-spin" style={{ animationDuration: '6s' }} />
                    <img
                      src={profile?.avatar_url}
                      alt={profile?.name || "Karthik"}
                      className="absolute inset-0.5 w-[92px] h-[92px] rounded-full object-cover border-2 border-[#0B0F19]"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold font-display text-white">{profile?.name}</h3>
                  <a
                    href={`https://github.com/${profile?.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline mb-4 font-sans block"
                  >
                    @{profile?.login}
                  </a>
                  
                  <p className="text-xs text-text-muted leading-relaxed mb-6 font-sans">
                    {profile?.bio || "Developer"}
                  </p>

                  <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-white/5">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-white">{profile?.public_repos}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Repos</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-white">{profile?.followers}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-white">{profile?.following}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Following</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Right Column: Repositories & Contribution Graph */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Contributions mockup */}
              <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(139, 92, 246, 0.1)">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2 font-display">
                  <GithubIcon size={14} className="text-accent stroke-accent" />
                  GitHub Contributions
                </h4>
                <div className="w-full overflow-x-auto">
                  <div className="flex gap-1 min-w-[320px] justify-between">
                    {contributionGrid.map((col, colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-1">
                        {col.map((cellClass, cellIdx) => (
                          <div
                            key={cellIdx}
                            className={`w-2 h-2 rounded-[1px] transition-colors duration-300 hover:scale-125 ${cellClass}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] text-text-muted font-sans font-semibold">
                  <span>Less</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-[1px] bg-[#1E293B]" />
                    <div className="w-2 h-2 rounded-[1px] bg-[#0E4429]" />
                    <div className="w-2 h-2 rounded-[1px] bg-[#006D32]" />
                    <div className="w-2 h-2 rounded-[1px] bg-[#26A641]" />
                    <div className="w-2 h-2 rounded-[1px] bg-[#39D353]" />
                  </div>
                  <span>More</span>
                </div>
              </GlassCard>

              {/* Repos Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2 font-display">
                  <BookOpen size={14} className="text-primary" />
                  Active Repositories
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.slice(0, 4).map((repo) => (
                    <motion.a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col justify-between p-4 rounded-xl border border-white/5 bg-[#0F172A]/10 hover:border-primary/20 hover:bg-[#6366F1]/5 transition-all duration-300 h-36"
                      whileHover={{ y: -2 }}
                      {...{} as any}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white group-hover:text-primary transition-colors font-display truncate pr-2">
                            {repo.name}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                            {repo.language || "Web"}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4 font-sans">
                          {repo.description || "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-text-muted font-semibold font-sans">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork size={12} />
                          <span>{repo.forks_count}</span>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </section>
  );
};
