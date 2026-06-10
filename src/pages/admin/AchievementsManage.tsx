import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Award, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

interface Achievement {
  id?: number;
  title: string;
  description: string;
  category: string;
  display_order: number;
}

const categories = [
  "Professional Experience",
  "Academics",
  "Technical Expertise"
];

export const AchievementsManage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      console.error(err);
      showBanner("Failed to load achievements.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const openAddForm = () => {
    setEditingAchievement(null);
    setTitle('');
    setDescription('');
    setCategory(categories[0]);
    setDisplayOrder(0);
    setShowForm(true);
  };

  const openEditForm = (ach: Achievement) => {
    setEditingAchievement(ach);
    setTitle(ach.title);
    setDescription(ach.description || '');
    setCategory(ach.category);
    setDisplayOrder(ach.display_order);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        display_order: Number(displayOrder)
      };

      if (editingAchievement?.id) {
        const { error } = await supabase.from('achievements').update(payload).eq('id', editingAchievement.id);
        if (error) throw error;
        showBanner("Achievement updated successfully!", "success");
      } else {
        const { error } = await supabase.from('achievements').insert([payload]);
        if (error) throw error;
        showBanner("Achievement created successfully!", "success");
      }

      setShowForm(false);
      fetchAchievements();
    } catch (err) {
      console.error(err);
      showBanner("Failed to save achievement details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;
    try {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) throw error;
      showBanner("Achievement deleted successfully!", "success");
      fetchAchievements();
    } catch (err) {
      console.error(err);
      showBanner("Failed to delete achievement.", "error");
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
          <h1 className="text-2xl font-bold font-display text-white">Achievements Manager</h1>
          <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Perform CRUD actions to manage highlights cards displayed on the portfolio.</p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            onClick={openAddForm}
            icon={<Plus size={16} />}
            className="text-xs font-semibold py-2.5 px-4"
          >
            Add Achievement
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
              {editingAchievement ? 'Edit Achievement Details' : 'Add New Achievement Entry'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="ach-title">Achievement Title</label>
                <input
                  id="ach-title"
                  type="text"
                  required
                  placeholder="3 Internships Completed"
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="ach-category">Category</label>
                <select
                  id="ach-category"
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all [&_option]:bg-[#0B0F19]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-xs font-semibold text-text-muted" htmlFor="ach-order">Display Order</label>
                <input
                  id="ach-order"
                  type="number"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="ach-description">Short Description Summary</label>
                <textarea
                  id="ach-description"
                  rows={4}
                  required
                  placeholder="Describe the milestone details briefly..."
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
                {submitting ? 'Saving...' : 'Save Achievement'}
              </Button>
            </div>
          </form>
        </GlassCard>
      ) : (
        /* Achievements List Cards */
        <div className="space-y-4 font-sans">
          {achievements.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl">
              <Award className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">No achievements stored. Click "Add Achievement" to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#0F172A]/10 hover:border-white/10 hover:bg-[#0F172A]/20 transition-all duration-300"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="text-sm font-bold text-white">{ach.title}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 px-1.5 py-0.5 rounded-md">{ach.category}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md">Order: {ach.display_order}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed font-sans line-clamp-1">{ach.description}</p>
                  </div>

                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <button
                      onClick={() => openEditForm(ach)}
                      className="p-2.5 rounded-xl border border-white/5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Edit Achievement"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => ach.id && handleDelete(ach.id)}
                      className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors cursor-pointer"
                      title="Delete Achievement"
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
