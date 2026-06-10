import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Code, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

interface Skill {
  id?: number;
  name: string;
  category: string;
  icon?: string;
  display_order: number;
}

const categories = [
  "Programming Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Tools"
];

export const SkillsManage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [displayOrder, setDisplayOrder] = useState(0);
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });
      if (error) throw error;
      setSkills(data || []);
    } catch (err) {
      console.error(err);
      showBanner("Failed to load skills.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const openAddForm = () => {
    setEditingSkill(null);
    setName('');
    setCategory(categories[0]);
    setDisplayOrder(0);
    setShowForm(true);
  };

  const openEditForm = (skill: Skill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setDisplayOrder(skill.display_order);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        category,
        display_order: Number(displayOrder)
      };

      if (editingSkill?.id) {
        const { error } = await supabase.from('skills').update(payload).eq('id', editingSkill.id);
        if (error) throw error;
        showBanner("Skill updated successfully!", "success");
      } else {
        const { error } = await supabase.from('skills').insert([payload]);
        if (error) throw error;
        showBanner("Skill created successfully!", "success");
      }

      setShowForm(false);
      fetchSkills();
    } catch (err) {
      console.error(err);
      showBanner("Failed to save skill.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      showBanner("Skill deleted successfully!", "success");
      fetchSkills();
    } catch (err) {
      console.error(err);
      showBanner("Failed to delete skill.", "error");
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
          <h1 className="text-2xl font-bold font-display text-white">Skills Manager</h1>
          <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Perform CRUD actions to manage your technologies groups dynamically.</p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            onClick={openAddForm}
            icon={<Plus size={16} />}
            className="text-xs font-semibold py-2.5 px-4"
          >
            Add Skill
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
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
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
                <label className="text-xs font-semibold text-text-muted" htmlFor="skill-name">Skill Name</label>
                <input
                  id="skill-name"
                  type="text"
                  required
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="skill-category">Category</label>
                <select
                  id="skill-category"
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

            <div className="flex flex-col gap-1.5 max-w-sm">
              <label className="text-xs font-semibold text-text-muted" htmlFor="skill-order">Display Order</label>
              <input
                id="skill-order"
                type="number"
                required
                className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
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
                {submitting ? 'Saving...' : 'Save Skill'}
              </Button>
            </div>
          </form>
        </GlassCard>
      ) : (
        /* Skills List Table */
        <div className="grid grid-cols-1 gap-6">
          {categories.map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat);
            
            return (
              <GlassCard
                key={cat}
                className="p-6 border border-white/5 bg-[#0F172A]/10"
                glowColor="rgba(99, 102, 241, 0.08)"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2 font-display">
                  <Code size={16} className="text-primary" />
                  {cat}
                </h3>

                {catSkills.length === 0 ? (
                  <p className="text-xs text-text-muted font-sans font-semibold">No skills added in this category yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-sans">
                    {catSkills.map((sk) => (
                      <div
                        key={sk.id}
                        className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{sk.name}</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted mt-0.5">Order: {sk.display_order}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditForm(sk)}
                            className="p-1.5 rounded-lg border border-white/5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => sk.id && handleDelete(sk.id)}
                            className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
