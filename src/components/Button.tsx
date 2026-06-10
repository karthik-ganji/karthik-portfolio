import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  asAnchor?: boolean;
  href?: string;
  download?: boolean | string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  iconPosition = 'right',
  className = '',
  asAnchor = false,
  href = '',
  download,
  target,
  rel,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer select-none text-sm px-6 py-3";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent text-white hover:opacity-95 shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.45)] border border-white/10",
    secondary: "glass-panel text-white hover:bg-white/5 border border-white/10",
    outline: "border border-primary/50 text-white hover:bg-primary/10"
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="mr-2 inline-block">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="ml-2 inline-block">{icon}</span>}
    </>
  );

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  if (asAnchor) {
    const anchorProps: Record<string, any> = {};
    if (download) {
      anchorProps.download = download;
    }
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        className={combinedClassName}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...anchorProps as any}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={combinedClassName}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props as any}
    >
      {content}
    </motion.button>
  );
};
