import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  User, LayoutDashboard, Code, BookOpen, Briefcase, GraduationCap, 
  Award, MessageSquare, LogOut, Globe, Code2, Menu, X, FileText, Activity
} from 'lucide-react';
import { CanvasParticles } from '../../components/CanvasParticles';

// Import Sub-modules
import { Overview } from './Overview';
import { ProfileManage } from './ProfileManage';
import { ResumeManage } from './ResumeManage';
import { ProjectsManage } from './ProjectsManage';
import { SkillsManage } from './SkillsManage';
import { ExperienceManage } from './ExperienceManage';
import { EducationManage } from './EducationManage';
import { AchievementsManage } from './AchievementsManage';
import { MessagesManage } from './MessagesManage';
import { SystemHealth } from './SystemHealth';

type TabType = 'overview' | 'profile' | 'resume' | 'projects' | 'skills' | 'experience' | 'education' | 'achievements' | 'messages' | 'system';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync tab with URL pathname
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    if (path === '/admin') {
      setActiveTab('overview');
    } else {
      const tab = path.split('/').pop();
      if (tab && ['overview', 'profile', 'resume', 'projects', 'skills', 'experience', 'education', 'achievements', 'messages', 'system'].includes(tab)) {
        setActiveTab(tab as TabType);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    // Fetch unread messages count
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        if (error) throw error;
        setUnreadCount(count || 0);
      } catch (err) {
        console.error("Failed to fetch unread messages count:", err);
      }
    };

    fetchUnreadCount();

    // Subscribe to messages changes
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleTabChange = (tabId: TabType) => {
    if (tabId === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${tabId}`);
    }
    setSidebarOpen(false);
  };

  const navItems = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'profile', name: 'Profile CRUD', icon: <User size={18} /> },
    { id: 'resume', name: 'Resume CRUD', icon: <FileText size={18} /> },
    { id: 'projects', name: 'Projects CRUD', icon: <BookOpen size={18} /> },
    { id: 'skills', name: 'Skills CRUD', icon: <Code size={18} /> },
    { id: 'achievements', name: 'Achievements CRUD', icon: <Award size={18} /> },
    { id: 'experience', name: 'Experience CRUD', icon: <Briefcase size={18} /> },
    { id: 'education', name: 'Education CRUD', icon: <GraduationCap size={18} /> },
    { id: 'messages', name: 'Messages Inbox', icon: <MessageSquare size={18} />, badge: unreadCount },
    { id: 'system', name: 'System Health', icon: <Activity size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={(tab) => handleTabChange(tab as TabType)} />;
      case 'profile':
        return <ProfileManage />;
      case 'resume':
        return <ResumeManage />;
      case 'projects':
        return <ProjectsManage />;
      case 'skills':
        return <SkillsManage />;
      case 'experience':
        return <ExperienceManage />;
      case 'education':
        return <EducationManage />;
      case 'achievements':
        return <AchievementsManage />;
      case 'messages':
        return <MessagesManage refreshUnreadCount={() => {
          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .then(({ count }) => setUnreadCount(count || 0));
        }} />;
      case 'system':
        return <SystemHealth />;
      default:
        return <Overview setActiveTab={(tab) => handleTabChange(tab as TabType)} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col md:flex-row">
      <CanvasParticles />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0F172A]/80 border-b border-white/5 z-40 w-full sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-primary to-accent">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-white">KG Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-text-muted hover:text-white"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-0 transition-transform duration-300 ease-in-out w-64 border-r border-white/5 bg-[#0B0F19]/90 md:bg-[#0B0F19]/50 backdrop-blur-xl md:backdrop-blur-none z-30 flex flex-col justify-between h-screen p-6`}>
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Logo brand */}
          <div className="hidden md:flex items-center gap-2.5 pb-4 border-b border-white/5">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-primary to-accent">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-white">
              KG Admin<span className="text-primary">.</span>
            </span>
          </div>

          {/* Navigation link items */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as TabType)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${activeTab === item.id ? 'bg-gradient-to-r from-primary/10 to-accent/10 text-white border-l-2 border-primary pl-3' : 'text-text-muted hover:text-white hover:bg-white/3 pl-4'}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-primary/25 border border-primary/40 px-2 py-0.5 rounded-full text-[9px] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="space-y-2.5 pt-4 border-t border-white/5 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-white hover:bg-white/3 transition-all cursor-pointer"
          >
            <Globe size={16} />
            <span>Public Site</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
};
