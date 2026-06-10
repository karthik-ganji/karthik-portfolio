import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { SocialLinks } from '../components/SocialLinks';
import { supabase } from '../lib/supabase';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [profile, setProfile] = useState({
    phone: '',
    email: ''
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('phone, email')
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setProfile({
            phone: data[0].phone || '',
            email: data[0].email || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch contact details from database:", err);
      }
    };
    fetchContactInfo();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>();

  const onSubmit = async (formData: ContactFormData) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // Insert visitor submission into Supabase Messages table
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            is_read: false
          }
        ]);

      if (error) throw error;

      setIsSuccess(true);
      reset();
      
      // Reset success banner after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error("Message insertion failed:", err);
      setErrorMessage(err.message || 'Failed to deliver message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden bg-[#0B0F19]/50 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          title="Contact Me"
          subtitle="Get in touch. Send an email or fill out the form, and I will get back to you as soon as possible."
          badge="Get In Touch"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* Left Block: Info Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Phone Card */}
            {profile.phone && (
              <GlassCard className="p-5 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.1)">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-primary shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted font-display">Call Me</h4>
                    <a href={`tel:${profile.phone.replace(/\s+/g, '')}`} className="text-sm font-semibold text-white hover:text-primary transition-colors font-sans">
                      {profile.phone}
                    </a>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Email Card */}
            {profile.email && (
              <GlassCard className="p-5 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(139, 92, 246, 0.1)">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-accent shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted font-display">Email Me</h4>
                    <a href={`mailto:${profile.email}`} className="text-sm font-semibold text-white hover:text-accent transition-colors font-sans truncate block max-w-[180px] sm:max-w-none">
                      {profile.email}
                    </a>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Connect Card */}
            <GlassCard className="p-5 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.08)">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted font-display mb-3">Connect Online</h4>
              <SocialLinks />
            </GlassCard>

          </div>

          {/* Right Block: Interactive Form */}
          <div className="lg:col-span-8">
            <GlassCard className="p-6 sm:p-8 border border-white/5 bg-[#0F172A]/20" glowColor="rgba(99, 102, 241, 0.12)">
              
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  /* Success Frame */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="text-emerald-500 mb-4"
                    >
                      <CheckCircle2 size={48} className="animate-[pulse_2s_infinite]" />
                    </motion.div>
                    <h3 className="text-lg font-bold font-display text-white mb-2">Message Sent Successfully!</h3>
                    <p className="text-xs text-text-muted font-sans max-w-sm">
                      Thank you, Karthik will review your submission and reply shortly.
                    </p>
                  </motion.div>
                ) : (
                  /* Input Form Frame */
                  <motion.form
                    onSubmit={handleSubmit(onSubmit)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {errorMessage && (
                      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-2.5 text-xs text-rose-400 font-sans font-semibold mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Input */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-xs font-semibold text-text-muted font-display">Your Name</label>
                        <input
                          id="name"
                          type="text"
                          autoComplete="name"
                          className={`px-4 py-3 rounded-xl bg-white/3 border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans transition-all ${errors.name ? 'border-rose-500' : 'border-white/5'}`}
                          placeholder="John Doe"
                          {...register("name", { required: "Name is required" })}
                        />
                        {errors.name && (
                          <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 font-sans">
                            <AlertCircle size={10} /> {errors.name.message}
                          </span>
                        )}
                      </div>

                      {/* Email Input */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-text-muted font-display">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          className={`px-4 py-3 rounded-xl bg-white/3 border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans transition-all ${errors.email ? 'border-rose-500' : 'border-white/5'}`}
                          placeholder="john@example.com"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                              message: "Invalid email address"
                            }
                          })}
                        />
                        {errors.email && (
                          <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 font-sans">
                            <AlertCircle size={10} /> {errors.email.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="subject" className="text-xs font-semibold text-text-muted font-display">Subject</label>
                      <input
                        id="subject"
                        type="text"
                        className={`px-4 py-3 rounded-xl bg-white/3 border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans transition-all ${errors.subject ? 'border-rose-500' : 'border-white/5'}`}
                        placeholder="Collaboration / Job Posting"
                        {...register("subject", { required: "Subject is required" })}
                      />
                      {errors.subject && (
                        <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 font-sans">
                          <AlertCircle size={10} /> {errors.subject.message}
                        </span>
                      )}
                    </div>

                    {/* Message Textarea */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="message" className="text-xs font-semibold text-text-muted font-display">Message</label>
                      <textarea
                        id="message"
                        rows={4}
                        className={`px-4 py-3 rounded-xl bg-white/3 border text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans transition-all ${errors.message ? 'border-rose-500' : 'border-white/5'}`}
                        placeholder="Hi Karthik, I would love to talk about..."
                        {...register("message", { required: "Message content is required" })}
                      />
                      {errors.message && (
                        <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 font-sans">
                          <AlertCircle size={10} /> {errors.message.message}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="w-full justify-center text-sm font-semibold h-12"
                      icon={<Send size={14} />}
                    >
                      {isSubmitting ? "Sending Message..." : "Send Message"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

            </GlassCard>
          </div>

        </div>

      </div>
    </section>
  );
};
