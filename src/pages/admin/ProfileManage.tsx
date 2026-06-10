import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, FileText, Settings, Upload, CheckCircle, RefreshCw, X, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

export const ProfileManage: React.FC = () => {
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    tagline: '',
    about_me: '',
    phone: '',
    email: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    avatar_url: '',
    resume_url: '',
    role_titles: [] as string[]
  });

  const [newRoleTitle, setNewRoleTitle] = useState('');

  const addRoleTitle = () => {
    if (newRoleTitle.trim()) {
      setProfile(prev => ({
        ...prev,
        role_titles: [...(prev.role_titles || []), newRoleTitle.trim()]
      }));
      setNewRoleTitle('');
    }
  };

  const removeRoleTitle = (index: number) => {
    setProfile(prev => ({
      ...prev,
      role_titles: (prev.role_titles || []).filter((_, i) => i !== index)
    }));
  };

  const moveRoleTitle = (index: number, direction: 'up' | 'down') => {
    const titles = [...(profile.role_titles || [])];
    if (direction === 'up' && index > 0) {
      [titles[index - 1], titles[index]] = [titles[index], titles[index - 1]];
    } else if (direction === 'down' && index < titles.length - 1) {
      [titles[index + 1], titles[index]] = [titles[index], titles[index + 1]];
    }
    setProfile(prev => ({
      ...prev,
      role_titles: titles
    }));
  };


  const [dsa, setDsa] = useState({
    leetcodeSolved: '0',
    hackerrankSolved: '0',
    leetcodeUrl: '',
    hackerrankUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingDsa, setSavingDsa] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProfileAndSettings();
  }, []);

  const fetchProfileAndSettings = async () => {
    try {
      setLoading(true);
      // Fetch profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (profileErr) throw profileErr;
      if (profileData && profileData.length > 0) {
        setProfile({
          ...profileData[0],
          role_titles: profileData[0].role_titles || []
        });
      }

      // Fetch DSA settings
      const { data: settingsData, error: settingsErr } = await supabase
        .from('settings')
        .select('*');

      if (settingsErr) throw settingsErr;
      if (settingsData) {
        const dsaState = { ...dsa };
        settingsData.forEach((setting) => {
          if (setting.key === 'leetcode_solved') dsaState.leetcodeSolved = setting.value;
          if (setting.key === 'hackerrank_solved') dsaState.hackerrankSolved = setting.value;
          if (setting.key === 'leetcode_url') dsaState.leetcodeUrl = setting.value;
          if (setting.key === 'hackerrank_url') dsaState.hackerrankUrl = setting.value;
        });
        setDsa(dsaState);
      }
    } catch (err) {
      console.error("Failed to load profile settings:", err);
      showBanner("Failed to load database values.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { id, ...updateFields } = profile;
      let error;

      if (id) {
        const res = await supabase.from('profiles').update(updateFields).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('profiles').insert([updateFields]).select();
        error = res.error;
        if (res.data && res.data.length > 0) {
          setProfile(res.data[0]);
        }
      }

      if (error) throw error;
      showBanner("Profile updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showBanner("Failed to save profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDsaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDsa(true);
    try {
      const updates = [
        { key: 'leetcode_solved', value: dsa.leetcodeSolved },
        { key: 'hackerrank_solved', value: dsa.hackerrankSolved },
        { key: 'leetcode_url', value: dsa.leetcodeUrl },
        { key: 'hackerrank_url', value: dsa.hackerrankUrl },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });
        if (error) throw error;
      }

      showBanner("DSA metrics synchronized successfully!", "success");
    } catch (err) {
      console.error(err);
      showBanner("Failed to save settings.", "error");
    } finally {
      setSavingDsa(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'resume') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingResume(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadErr } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      // Update local state and profiles table
      const updatedProfile = { ...profile };
      if (type === 'avatar') {
        updatedProfile.avatar_url = publicUrl;
      } else {
        updatedProfile.resume_url = publicUrl;
      }

      const { error: updateDbErr } = await supabase
        .from('profiles')
        .update({
          avatar_url: updatedProfile.avatar_url,
          resume_url: updatedProfile.resume_url,
        })
        .eq('id', profile.id);

      if (updateDbErr) throw updateDbErr;

      setProfile(updatedProfile);
      showBanner(`${type === 'avatar' ? 'Profile Photo' : 'Resume PDF'} uploaded successfully!`, "success");
    } catch (err: any) {
      console.error("Asset upload failure:", err);
      showBanner(err.message || "Failed to upload file.", "error");
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingResume(false);
    }
  };

  const handleFileDelete = async (type: 'avatar' | 'resume') => {
    const url = type === 'avatar' ? profile.avatar_url : profile.resume_url;
    if (!url) return;

    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingResume(true);

    try {
      // Extract file path from URL
      const pathParts = url.split('/portfolio-assets/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from('portfolio-assets').remove([filePath]);
      }

      // Update database profile
      const updatedProfile = { ...profile };
      if (type === 'avatar') updatedProfile.avatar_url = '';
      else updatedProfile.resume_url = '';

      const { error: updateDbErr } = await supabase
        .from('profiles')
        .update({
          avatar_url: updatedProfile.avatar_url,
          resume_url: updatedProfile.resume_url,
        })
        .eq('id', profile.id);

      if (updateDbErr) throw updateDbErr;

      setProfile(updatedProfile);
      showBanner(`${type === 'avatar' ? 'Profile Photo' : 'Resume PDF'} removed successfully!`, "success");
    } catch (err) {
      console.error(err);
      showBanner("Failed to delete asset file.", "error");
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg mb-6" />
        <div className="h-64 bg-white/3 rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Profile & Asset Manager</h1>
        <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Manage your biographical information, social hooks, profile picture, resume PDF, and DSA stats.</p>
      </div>

      {/* Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-sans font-semibold ${message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/20 bg-rose-500/5 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Bio Form */}
          <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.1)">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2 font-display">
              <User size={16} className="text-primary" />
              Biographical Details
            </h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="profile-name">Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    required
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="profile-phone">Phone</label>
                  <input
                    id="profile-phone"
                    type="text"
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="profile-location">Location</label>
                  <input
                    id="profile-location"
                    type="text"
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="profile-tagline">Tagline</label>
                <input
                  id="profile-tagline"
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="profile-bio">About Me Summary</label>
                <textarea
                  id="profile-bio"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={profile.about_me}
                  onChange={(e) => setProfile({ ...profile, about_me: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="profile-github">GitHub Profile URL</label>
                  <input
                    id="profile-github"
                    type="url"
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={profile.github_url}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="profile-linkedin">LinkedIn Profile URL</label>
                  <input
                    id="profile-linkedin"
                    type="url"
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  />
                </div>
              </div>

              {/* Role Titles Section */}
              <div className="flex flex-col gap-2.5 pt-6 border-t border-white/5">
                <label className="text-xs font-semibold text-text-muted">Rotating Role Titles (Hero Rotator)</label>
                
                <div className="space-y-2">
                  {(profile.role_titles || []).map((title, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/5 text-sm text-white">
                      <span className="flex-1 font-sans">{title}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveRoleTitle(index, 'up')}
                          className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent text-text-muted hover:text-white transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === (profile.role_titles || []).length - 1}
                          onClick={() => moveRoleTitle(index, 'down')}
                          className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent text-text-muted hover:text-white transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRoleTitle(index)}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
                          title="Remove Title"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(!profile.role_titles || profile.role_titles.length === 0) && (
                    <p className="text-xs text-text-muted font-sans italic">No role titles configured yet. Add some below to display in the Hero section.</p>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="e.g., Senior Backend Engineer"
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white/3 border border-white/5 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRoleTitle();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addRoleTitle}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-xs text-white font-semibold transition-colors cursor-pointer"
                  >
                    Add Title
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={savingProfile}
                  className="text-xs py-2.5 px-6 font-semibold"
                  icon={savingProfile ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : null}
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* DSA Form */}
          <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(139, 92, 246, 0.1)">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2 font-display">
              <Settings size={16} className="text-accent" />
              DSA Platforms Variables
            </h3>
            
            <form onSubmit={handleDsaSubmit} className="space-y-4 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="leetcode-solved">LeetCode Solved Problems</label>
                  <input
                    id="leetcode-solved"
                    type="number"
                    min="0"
                    required
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={dsa.leetcodeSolved}
                    onChange={(e) => setDsa({ ...dsa, leetcodeSolved: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="hackerrank-solved">HackerRank Solved Problems</label>
                  <input
                    id="hackerrank-solved"
                    type="number"
                    min="0"
                    required
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={dsa.hackerrankSolved}
                    onChange={(e) => setDsa({ ...dsa, hackerrankSolved: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="leetcode-url">LeetCode Profile URL</label>
                  <input
                    id="leetcode-url"
                    type="url"
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={dsa.leetcodeUrl}
                    onChange={(e) => setDsa({ ...dsa, leetcodeUrl: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted" htmlFor="hackerrank-url">HackerRank Profile URL</label>
                  <input
                    id="hackerrank-url"
                    type="url"
                    className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    value={dsa.hackerrankUrl}
                    onChange={(e) => setDsa({ ...dsa, hackerrankUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={savingDsa}
                  className="text-xs py-2.5 px-6 font-semibold"
                  icon={savingDsa ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : null}
                >
                  {savingDsa ? "Saving Stats..." : "Save DSA Parameters"}
                </Button>
              </div>
            </form>
          </GlassCard>

        </div>

        {/* Right Column: Upload assets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile photo manager */}
          <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.1)">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2 font-display">
              <User size={14} className="text-primary" />
              Profile Photo
            </h3>

            <div className="flex flex-col items-center gap-4">
              <div className="relative w-28 h-28 rounded-full border border-white/10 overflow-hidden bg-[#0B0F19] flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-text-muted font-sans font-semibold">No Image</span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 w-full">
                <label className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-xl border border-white/5 bg-white/3 text-xs text-white hover:bg-white/5 font-sans font-semibold cursor-pointer select-none">
                  <Upload size={14} />
                  <span>{profile.avatar_url ? 'Replace' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    disabled={uploadingAvatar}
                  />
                </label>
                {profile.avatar_url && (
                  <button
                    onClick={() => handleFileDelete('avatar')}
                    disabled={uploadingAvatar}
                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Resume manager */}
          <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(139, 92, 246, 0.1)">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2 font-display">
              <FileText size={14} className="text-accent" />
              Resume PDF File
            </h3>

            <div className="flex flex-col items-center gap-4">
              <div className="w-full p-4 rounded-xl border border-white/5 bg-white/3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="text-accent shrink-0" size={20} />
                  <span className="text-xs text-white font-sans font-semibold truncate">
                    {profile.resume_url ? 'resume.pdf' : 'No resume uploaded'}
                  </span>
                </div>
                {profile.resume_url && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Active</span>
                )}
              </div>

              {uploadingResume && (
                <div className="flex items-center gap-2 text-xs text-text-muted font-sans animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                  <span>Uploading PDF...</span>
                </div>
              )}

              <div className="flex gap-2 w-full">
                <label className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-xl border border-white/5 bg-white/3 text-xs text-white hover:bg-white/5 font-sans font-semibold cursor-pointer select-none">
                  <Upload size={14} />
                  <span>{profile.resume_url ? 'Replace PDF' : 'Upload PDF'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'resume')}
                    disabled={uploadingResume}
                  />
                </label>
                {profile.resume_url && (
                  <button
                    onClick={() => handleFileDelete('resume')}
                    disabled={uploadingResume}
                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
