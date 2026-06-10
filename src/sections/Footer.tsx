import React from 'react';
import { SocialLinks } from '../components/SocialLinks';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-white/5 bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <span className="font-display font-bold text-base tracking-tight text-white block mb-1">
              Karthik Ganji<span className="text-primary">.</span>
            </span>
            <p className="text-xs text-text-muted font-sans font-semibold">
              &copy; {currentYear} Karthik Ganji. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <SocialLinks iconSize={16} />

          {/* Designer Credit */}
          <div className="text-center md:text-right">
            <p className="text-xs text-text-muted font-sans font-semibold">
              Designed and Developed by{" "}
              <span className="text-[#F8FAFC] font-medium hover:text-primary transition-colors cursor-pointer">
                Karthik Ganji
              </span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
