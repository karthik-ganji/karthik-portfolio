import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { FileText, Upload, Trash2, Eye, RefreshCw, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

export const ResumeManage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, resume_url')
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setProfile(data[0]);
      }
    } catch (err) {
      console.error("Failed to load profile for resume:", err);
      showBanner("Failed to retrieve profile assets data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showBanner("Invalid file type. Only PDF documents are allowed.", "error");
      return;
    }

    setUploading(true);
    try {
      // Create a default profile row if none exists
      let profileId = profile?.id;
      if (!profileId) {
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || '';
        const { data: newProfile, error: createErr } = await supabase
          .from('profiles')
          .insert([{ name: 'Karthik Ganji', email: userEmail }])
          .select();
        
        if (createErr) throw createErr;
        if (newProfile && newProfile.length > 0) {
          profileId = newProfile[0].id;
          setProfile(newProfile[0]);
        } else {
          throw new Error("Could not initialize profile row in database.");
        }
      }

      const fileName = `resume-${Date.now()}.pdf`;
      const filePath = `resumes/${fileName}`;

      // Upload PDF file to Supabase storage public assets bucket
      const { error: uploadErr } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadErr) throw uploadErr;

      // Retrieve public url link
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      // Update database profile
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrl })
        .eq('id', profileId);

      if (dbErr) throw dbErr;

      setProfile((prev: any) => ({ ...prev, id: profileId, resume_url: publicUrl }));
      showBanner("Resume PDF uploaded successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showBanner(err.message || "Failed to upload resume file.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile?.resume_url) return;
    if (!window.confirm("Are you sure you want to delete your resume? Recruiter download CTAs will hide automatically.")) return;

    setUploading(true);
    try {
      const url = profile.resume_url;
      const pathParts = url.split('/portfolio-assets/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        // Delete from storage bucket
        await supabase.storage.from('portfolio-assets').remove([filePath]);
      }

      // Update database profile
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ resume_url: null })
        .eq('id', profile.id);

      if (dbErr) throw dbErr;

      setProfile((prev: any) => ({ ...prev, resume_url: '' }));
      showBanner("Resume file removed successfully!", "success");
    } catch (err) {
      console.error(err);
      showBanner("Failed to delete resume file.", "error");
    } finally {
      setUploading(false);
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

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6 font-sans">
        <h1 className="text-2xl font-bold font-display text-white">Resume Management</h1>
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4 text-xs text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <h4 className="font-bold mb-1 text-sm">Supabase Offline Mode</h4>
            <p className="leading-relaxed">
              Resume management is unavailable because Supabase is not configured. Please set up your local environment variables in your <code>.env</code> file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Resume Management</h1>
        <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Upload, replace, or delete your professional PDF resume downloaded by recruiters on your public site.</p>
      </div>

      {/* Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-sans font-semibold ${message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/20 bg-rose-500/5 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-6 sm:p-8 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.12)">
          
          <div className="flex flex-col items-center text-center gap-6 py-6 font-sans">
            
            {/* Centered Large Icon */}
            <div className={`p-5 rounded-2xl border ${profile?.resume_url ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <FileText size={48} className={uploading ? 'animate-[pulse_1s_infinite]' : ''} />
            </div>

            {/* Current Status Message */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-display">
                {profile?.resume_url ? 'Resume PDF is Active' : 'No Resume Uploaded'}
              </h3>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                {profile?.resume_url 
                  ? 'Your PDF resume is stored in Supabase Storage. The public download buttons link directly to this file.' 
                  : 'Recruiters visiting the site will not see a Download button until a valid PDF resume is uploaded.'
                }
              </p>
            </div>

            {/* Loading Indicator */}
            {uploading && (
              <div className="flex items-center gap-2 text-xs text-text-muted animate-pulse">
                <RefreshCw size={14} className="animate-spin text-primary" />
                <span>Processing file operation...</span>
              </div>
            )}

            {/* Actions Grid */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4">
              
              {/* Upload Input trigger */}
              <label className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-white/5 bg-primary hover:bg-primary/95 text-xs text-white font-semibold cursor-pointer select-none transition-colors">
                <Upload size={14} />
                <span>{profile?.resume_url ? 'Replace Resume PDF' : 'Upload Resume PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>

              {/* Preview Button */}
              {profile?.resume_url && (
                <Button
                  variant="secondary"
                  asAnchor
                  href={profile.resume_url}
                  target="_blank"
                  icon={<Eye size={14} />}
                  className="w-full sm:w-auto text-xs py-3 px-6"
                >
                  Preview PDF
                </Button>
              )}

              {/* Delete Button */}
              {profile?.resume_url && (
                <button
                  onClick={handleDelete}
                  disabled={uploading}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete Resume</span>
                </button>
              )}

            </div>

          </div>

        </GlassCard>
      </div>

    </div>
  );
};
