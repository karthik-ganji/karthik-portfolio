import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Briefcase, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

interface Experience {
  id?: number;
  company: string;
  role: string;
  duration: string;
  description: string;
  display_order: number;
}

export const ExperienceManage: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setExperiences(data || []);
    } catch (err) {
      console.error(err);
      showBanner("Failed to load experience items.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const openAddForm = () => {
    setEditingExperience(null);
    setCompany('');
    setRole('');
    setDuration('');
    setDescription('');
    setDisplayOrder(0);
    setShowForm(true);
  };

  const openEditForm = (exp: Experience) => {
    setEditingExperience(exp);
    setCompany(exp.company);
    setRole(exp.role);
    setDuration(exp.duration);
    setDescription(exp.description || '');
    setDisplayOrder(exp.display_order);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        company,
        role,
        duration,
        description,
        display_order: Number(displayOrder)
      };

      if (editingExperience?.id) {
        const { error } = await supabase.from('experience').update(payload).eq('id', editingExperience.id);
        if (error) throw error;
        showBanner("Experience updated successfully!", "success");
      } else {
        const { error } = await supabase.from('experience').insert([payload]);
        if (error) throw error;
        showBanner("Experience created successfully!", "success");
      }

      setShowForm(false);
      fetchExperiences();
    } catch (err) {
      console.error(err);
      showBanner("Failed to save experience item.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this experience record?")) return;
    try {
      const { error } = await supabase.from('experience').delete().eq('id', id);
      if (error) throw error;
      showBanner("Experience record deleted successfully!", "success");
      fetchExperiences();
    } catch (err) {
      console.error(err);
      showBanner("Failed to delete experience record.", "error");
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
          <h1 className="text-2xl font-bold font-display text-white">Experience Manager</h1>
          <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Perform CRUD actions to manage your timeline items.</p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            onClick={openAddForm}
            icon={<Plus size={16} />}
            className="text-xs font-semibold py-2.5 px-4"
          >
            Add Experience
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
              {editingExperience ? 'Edit Experience' : 'Add New Experience'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="exp-company">Company</label>
                <input
                  id="exp-company"
                  type="text"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="exp-role">Role / Job Title</label>
                <input
                  id="exp-role"
                  type="text"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="exp-duration">Duration</label>
                <input
                  id="exp-duration"
                  type="text"
                  required
                  placeholder="May 2024 - Jul 2024"
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-xs font-semibold text-text-muted" htmlFor="exp-order">Display Order</label>
                <input
                  id="exp-order"
                  type="number"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="exp-description">Work Description</label>
                <textarea
                  id="exp-description"
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
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
                {submitting ? 'Saving...' : 'Save Experience'}
              </Button>
            </div>
          </form>
        </GlassCard>
      ) : (
        /* List cards */
        <div className="space-y-4 font-sans">
          {experiences.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl">
              <Briefcase className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">No experience entries found. Click "Add Experience" to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#0F172A]/10 hover:border-white/10 hover:bg-[#0F172A]/20 transition-all duration-300"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="text-sm font-bold text-white">{exp.role}</span>
                      <span className="text-xs text-text-muted">at {exp.company}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md">Order: {exp.display_order}</span>
                    </div>
                    <span className="text-xs text-primary font-semibold block">{exp.duration}</span>
                  </div>

                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <button
                      onClick={() => openEditForm(exp)}
                      className="p-2.5 rounded-xl border border-white/5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Edit Experience"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => exp.id && handleDelete(exp.id)}
                      className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors cursor-pointer"
                      title="Delete Experience"
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
