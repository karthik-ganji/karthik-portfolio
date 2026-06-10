import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, BookOpen, Upload, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

interface Project {
  id?: number;
  title: string;
  description: string;
  technologies: string[];
  github_url: string;
  live_demo_url?: string;
  image_url?: string;
  metrics: string[];
  is_featured: boolean;
  display_order: number;
}

export const ProjectsManage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techString, setTechString] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [metricString, setMetricString] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error(err);
      showBanner("Failed to fetch projects.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTechString('');
    setGithubUrl('');
    setLiveDemoUrl('');
    setMetricString('');
    setIsFeatured(false);
    setDisplayOrder(0);
    setImageFile(null);
    setImagePreview('');
    setEditingProject(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description || '');
    setTechString(proj.technologies ? proj.technologies.join(', ') : '');
    setGithubUrl(proj.github_url);
    setLiveDemoUrl(proj.live_demo_url || '');
    setMetricString(proj.metrics ? proj.metrics.join(', ') : '');
    setIsFeatured(proj.is_featured);
    setDisplayOrder(proj.display_order);
    setImagePreview(proj.image_url || '');
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalImageUrl = editingProject?.image_url || '';

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `project-${Date.now()}.${fileExt}`;
        const filePath = `projects/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('portfolio-assets')
          .upload(filePath, imageFile);

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-assets')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const payload = {
        title,
        description,
        technologies: techString.split(',').map((t) => t.trim()).filter(Boolean),
        github_url: githubUrl,
        live_demo_url: liveDemoUrl || null,
        image_url: finalImageUrl || null,
        metrics: metricString.split(',').map((m) => m.trim()).filter(Boolean),
        is_featured: isFeatured,
        display_order: Number(displayOrder),
      };

      if (editingProject?.id) {
        // Update
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingProject.id);
        if (error) throw error;
        showBanner("Project updated successfully!", "success");
      } else {
        // Insert
        const { error } = await supabase
          .from('projects')
          .insert([payload]);
        if (error) throw error;
        showBanner("Project created successfully!", "success");
      }

      setShowForm(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      console.error(err);
      showBanner("Failed to save project data.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      // Fetch project first to delete its image from storage
      const { data } = await supabase.from('projects').select('image_url').eq('id', id).single();
      if (data?.image_url && data.image_url.includes('/portfolio-assets/')) {
        const filePath = data.image_url.split('/portfolio-assets/')[1];
        await supabase.storage.from('portfolio-assets').remove([filePath]);
      }

      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;

      showBanner("Project deleted successfully!", "success");
      fetchProjects();
    } catch (err) {
      console.error(err);
      showBanner("Failed to delete project.", "error");
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Project Manager</h1>
          <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Perform CRUD actions and upload preview screenshots for your portfolio projects.</p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            onClick={openAddForm}
            icon={<Plus size={16} />}
            className="text-xs font-semibold py-2.5 px-4"
          >
            Add Project
          </Button>
        )}
      </div>

      {/* Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-sans font-semibold ${message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/20 bg-rose-500/5 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {showForm ? (
        /* Form Card */
        <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.1)">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="project-title">Project Title</label>
                <input
                  id="project-title"
                  type="text"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="project-order">Display Order</label>
                <input
                  id="project-order"
                  type="number"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-muted" htmlFor="project-description">Project Description</label>
              <textarea
                id="project-description"
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="project-github">GitHub Repository URL</label>
                <input
                  id="project-github"
                  type="url"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="project-live">Live Demo URL (Optional)</label>
                <input
                  id="project-live"
                  type="url"
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="project-tech">Technologies (comma-separated)</label>
                <input
                  id="project-tech"
                  type="text"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="React, FastAPI, Python"
                  value={techString}
                  onChange={(e) => setTechString(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="project-metrics">Project Metrics / KPIs (comma-separated)</label>
                <input
                  id="project-metrics"
                  type="text"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="R² Score ≈ 0.97, 85% Accuracy"
                  value={metricString}
                  onChange={(e) => setMetricString(e.target.value)}
                />
              </div>
            </div>

            {/* Project Image Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
              <div className="sm:col-span-8 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted">Upload Project Image / Snapshot</label>
                <label className="flex flex-col justify-center items-center h-28 rounded-xl border border-dashed border-white/10 bg-white/3 hover:bg-white/5 transition-all cursor-pointer font-sans select-none">
                  <Upload size={20} className="text-text-muted mb-1" />
                  <span className="text-xs text-text-muted font-medium">Click to select screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="sm:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted">Image Preview</label>
                <div className="h-28 rounded-xl border border-white/5 bg-[#0B0F19] overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-text-muted font-medium">No Image Uploaded</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 select-none">
              <input
                id="project-featured"
                type="checkbox"
                className="w-4 h-4 rounded bg-white/3 border border-white/5 accent-primary text-primary focus:ring-0 focus:outline-none cursor-pointer"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <label htmlFor="project-featured" className="text-xs font-semibold text-text-light cursor-pointer">Feature this project in active highlights</label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-xs py-2.5 px-4 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="text-xs py-2.5 px-6 font-semibold"
                icon={submitting ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : null}
              >
                {submitting ? 'Saving...' : 'Save Project'}
              </Button>
            </div>
          </form>
        </GlassCard>
      ) : (
        /* List Table */
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl font-sans">
              <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">No projects created yet. Click "Add Project" to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 font-sans">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#0F172A]/10 hover:border-white/10 hover:bg-[#0F172A]/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-12 rounded-lg border border-white/5 bg-[#0B0F19] shrink-0 overflow-hidden flex items-center justify-center">
                      {proj.image_url ? (
                        <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-text-muted font-bold uppercase">SVG Icon</span>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-none">{proj.title}</span>
                        {proj.is_featured && (
                          <span className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">Featured</span>
                        )}
                        <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md">Order: {proj.display_order}</span>
                      </div>
                      
                      <div className="flex gap-1.5 flex-wrap">
                        {proj.technologies?.slice(0, 4).map((tech) => (
                          <span key={tech} className="text-[9px] text-text-muted bg-white/3 border border-white/5 px-2 py-0.5 rounded">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <button
                      onClick={() => openEditForm(proj)}
                      className="p-2.5 rounded-xl border border-white/5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => proj.id && handleDelete(proj.id)}
                      className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
