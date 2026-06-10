import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        
        if (session && session.user) {
          const role = session.user.user_metadata?.role || session.user.app_metadata?.role;
          if (role === 'admin') {
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
          }
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        if (active) setAuthenticated(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session && session.user) {
        const role = session.user.user_metadata?.role || session.user.app_metadata?.role;
        if (role === 'admin') {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted font-sans font-semibold">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
