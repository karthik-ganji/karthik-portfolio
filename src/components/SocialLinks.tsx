import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface IconProps {
  size: number;
}

const GithubIcon: React.FC<IconProps> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<IconProps> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface SocialLinksProps {
  className?: string;
  iconSize?: number;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ className = '', iconSize = 20 }) => {
  const [profile, setProfile] = useState({
    github_url: '',
    linkedin_url: '',
    email: ''
  });

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('github_url, linkedin_url, email')
          .limit(1);
        
        if (error) throw error;
        if (data && data.length > 0) {
          setProfile({
            github_url: data[0].github_url || '',
            linkedin_url: data[0].linkedin_url || '',
            email: data[0].email || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch social links", err);
      }
    };
    fetchSocials();
  }, []);

  const links = [
    profile.github_url && {
      name: 'GitHub',
      url: profile.github_url,
      icon: <GithubIcon size={iconSize} />,
      hoverStyles: 'hover:text-[#F8FAFC] hover:border-white/30 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(248,250,252,0.15)]'
    },
    profile.linkedin_url && {
      name: 'LinkedIn',
      url: profile.linkedin_url,
      icon: <LinkedinIcon size={iconSize} />,
      hoverStyles: 'hover:text-[#6366F1] hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]'
    },
    profile.email && {
      name: 'Email',
      url: profile.email.startsWith('mailto:') ? profile.email : `mailto:${profile.email}`,
      icon: <Mail size={iconSize} />,
      hoverStyles: 'hover:text-[#8B5CF6] hover:border-accent/30 hover:bg-accent/5 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)]'
    }
  ].filter(Boolean) as any[];

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {links.map((link) => (
        <motion.a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          className={`flex items-center justify-center p-3 rounded-xl border border-white/5 text-text-muted bg-white/3 transition-all duration-300 ${link.hoverStyles}`}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          {...{} as any}
        >
          {link.icon}
        </motion.a>
      ))}
    </div>
  );
};
