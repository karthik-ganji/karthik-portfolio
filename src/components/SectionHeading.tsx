import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: 'left' | 'center';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badge,
  align = 'center',
}) => {
  const isCenter = align === 'center';

  return (
    <motion.div
      className={`mb-12 md:mb-16 flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {badge && (
        <span className="mb-3 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-display">
        {title}
      </h2>
      <div className={`mt-4 h-1 w-12 rounded bg-gradient-to-r from-primary to-accent ${isCenter ? 'mx-auto' : ''}`} />
      {subtitle && (
        <p className="mt-4 max-w-2xl text-sm md:text-base text-text-muted leading-relaxed font-sans">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
