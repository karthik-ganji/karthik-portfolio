import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, GraduationCap, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

interface Education {
  id?: number;
  degree: string;
  field: string;
  institution: string;
  metric: string;
  display_order: number;
}

export const EducationManage: React.FC = () => {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  // Form states
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [institution, setInstitution] = useState('');
  const [metric, setMetric] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setEducationList(data || []);
    } catch (err) {
      console.error(err);
      showBanner("Failed to load education entries.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const openAddForm = () => {
    setEditingEducation(null);
    setDegree('');
    setField('');
    setInstitution('');
    setMetric('');
    setDisplayOrder(0);
    setShowForm(true);
  };

  const openEditForm = (edu: Education) => {
    setEditingEducation(edu);
    setDegree(edu.degree);
    setField(edu.field);
    setInstitution(edu.institution);
    setMetric(edu.metric);
    setDisplayOrder(edu.display_order);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        degree,
        field,
        institution,
        metric,
        display_order: Number(displayOrder)
      };

      if (editingEducation?.id) {
        const { error } = await supabase.from('education').update(payload).eq('id', editingEducation.id);
        if (error) throw error;
        showBanner("Education item updated successfully!", "success");
      } else {
        const { error } = await supabase.from('education').insert([payload]);
        if (error) throw error;
        showBanner("Education item created successfully!", "success");
      }

      setShowForm(false);
      fetchEducation();
    } catch (err) {
      console.error(err);
      showBanner("Failed to save education details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this education entry?")) return;
    try {
      const { error } = await supabase.from('education').delete().eq('id', id);
      if (error) throw error;
      showBanner("Education entry deleted successfully!", "success");
      fetchEducation();
    } catch (err) {
      console.error(err);
      showBanner("Failed to delete education entry.", "error");
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
          <h1 className="text-2xl font-bold font-display text-white">Education Manager</h1>
          <p className="text-xs text-text-muted mt-1 font-sans font-semibold">Perform CRUD actions to manage your degrees and diplomas.</p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            onClick={openAddForm}
            icon={<Plus size={16} />}
            className="text-xs font-semibold py-2.5 px-4"
          >
            Add Education
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
              {editingEducation ? 'Edit Education Details' : 'Add New Education Entry'}
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
                <label className="text-xs font-semibold text-text-muted" htmlFor="edu-degree">Degree / Diploma Name</label>
                <input
                  id="edu-degree"
                  type="text"
                  required
                  placeholder="Bachelor of Technology"
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="edu-field">Field of Study</label>
                <input
                  id="edu-field"
                  type="text"
                  required
                  placeholder="Computer Science"
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-text-muted" htmlFor="edu-institution">Institution / College Name</label>
                <input
                  id="edu-institution"
                  type="text"
                  required
                  placeholder="Bapatla Engineering College"
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted" htmlFor="edu-metric">Academic Score</label>
                <input
                  id="edu-metric"
                  type="text"
                  required
                  placeholder="CGPA: 7.8 or Percentage: 83.88%"
                  className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-w-xs">
              <label className="text-xs font-semibold text-text-muted" htmlFor="edu-order">Display Order</label>
              <input
                id="edu-order"
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
                {submitting ? 'Saving...' : 'Save Education'}
              </Button>
            </div>
          </form>
        </GlassCard>
      ) : (
        /* Education List Table */
        <div className="space-y-4 font-sans">
          {educationList.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">No education records found. Click "Add Education" to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {educationList.map((edu) => (
                <div
                  key={edu.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#0F172A]/10 hover:border-white/10 hover:bg-[#0F172A]/20 transition-all duration-300"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="text-sm font-bold text-white">{edu.degree}</span>
                      <span className="text-xs text-text-muted">({edu.field})</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md">Order: {edu.display_order}</span>
                    </div>
                    <span className="text-xs text-text-muted font-semibold block">{edu.institution} &bull; <strong className="text-white">{edu.metric}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <button
                      onClick={() => openEditForm(edu)}
                      className="p-2.5 rounded-xl border border-white/5 text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Edit Education"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => edu.id && handleDelete(edu.id)}
                      className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors cursor-pointer"
                      title="Delete Education"
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
