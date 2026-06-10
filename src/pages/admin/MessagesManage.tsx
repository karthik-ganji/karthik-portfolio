import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Trash2, Search, Mail, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface MessagesManageProps {
  refreshUnreadCount: () => void;
}

export const MessagesManage: React.FC<MessagesManageProps> = ({ refreshUnreadCount }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    // Filter messages based on search query
    const filtered = messages.filter((msg) => {
      const query = searchQuery.toLowerCase();
      return (
        msg.name.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        (msg.subject && msg.subject.toLowerCase().includes(query)) ||
        msg.message.toLowerCase().includes(query)
      );
    });
    setFilteredMessages(filtered);
  }, [searchQuery, messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
      showBanner("Failed to retrieve messages.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setBanner({ text, type });
    setTimeout(() => setBanner({ text: '', type: '' }), 4000);
  };

  const handleMarkAsRead = async (msg: Message) => {
    if (msg.is_read) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', msg.id);

      if (error) throw error;

      // Update state
      setMessages(messages.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
      if (activeMessage && activeMessage.id === msg.id) {
        setActiveMessage({ ...activeMessage, is_read: true });
      }
      refreshUnreadCount();
    } catch (err) {
      console.error(err);
      showBanner("Failed to update read status.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;

      showBanner("Message deleted successfully!", "success");
      setMessages(messages.filter((m) => m.id !== id));
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage(null);
      }
      refreshUnreadCount();
    } catch (err) {
      console.error(err);
      showBanner("Failed to delete message.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectMessage = (msg: Message) => {
    setActiveMessage(msg);
    if (!msg.is_read) {
      handleMarkAsRead(msg);
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
        <h1 className="text-2xl font-bold font-display text-white">Inbox Messages</h1>
        <p className="text-xs text-text-muted mt-1 font-sans font-semibold">View, search, and manage incoming messages sent by visitors on your public site.</p>
      </div>

      {/* Banner */}
      {banner.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-sans font-semibold ${banner.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/20 bg-rose-500/5 text-rose-400'}`}>
          {banner.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{banner.text}</span>
        </div>
      )}

      {/* Search and Content Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Drawer: Inbox messages list */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative font-sans">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              placeholder="Search by name, email, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-xl font-sans">
                <p className="text-xs text-text-muted">No messages match search.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-3.5 rounded-xl border border-white/5 bg-[#0F172A]/10 hover:bg-[#0F172A]/20 transition-all cursor-pointer flex justify-between items-start gap-4 font-sans ${activeMessage?.id === msg.id ? 'border-primary/45 bg-[#6366F1]/5' : ''} ${!msg.is_read ? 'border-primary/20 bg-primary/2' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">{msg.name}</span>
                      {!msg.is_read && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">New</span>
                      )}
                    </div>
                    <span className="text-[10px] text-text-muted font-bold truncate block mb-1">{msg.subject || 'No Subject'}</span>
                    <p className="text-[10px] text-text-muted line-clamp-1 leading-normal font-medium">{msg.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-text-muted font-semibold">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => handleDelete(msg.id, e)}
                      disabled={submitting}
                      className="p-1 rounded-lg hover:bg-rose-500/10 text-text-muted hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Drawer: Open message details pane */}
        <div className="lg:col-span-7">
          {activeMessage ? (
            <GlassCard className="p-6 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.1)">
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-white/5 mb-6 font-sans">
                <div>
                  <h3 className="text-base font-bold text-white font-display mb-1">{activeMessage.name}</h3>
                  <div className="flex flex-col gap-1 text-xs text-text-muted">
                    <a href={`mailto:${activeMessage.email}`} className="hover:text-primary transition-colors flex items-center gap-1.5 font-semibold">
                      <Mail size={12} />
                      {activeMessage.email}
                    </a>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Calendar size={12} />
                      {new Date(activeMessage.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${activeMessage.is_read ? 'text-text-muted bg-white/5 border-white/10' : 'text-primary bg-primary/10 border-primary/20'}`}>
                  {activeMessage.is_read ? 'Read' : 'Unread'}
                </span>
              </div>

              <div className="space-y-4 font-sans">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Subject</h4>
                  <p className="text-sm font-bold text-white">{activeMessage.subject || 'No Subject'}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/3 border border-white/5 min-h-[150px]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Message Body</h4>
                  <p className="text-xs text-text-light leading-relaxed whitespace-pre-wrap font-medium">{activeMessage.message}</p>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/5 rounded-2xl font-sans">
              <MessageSquare className="w-8 h-8 text-text-muted mb-3" />
              <p className="text-xs text-text-muted">Select an inbox item on the left to read its message content details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
