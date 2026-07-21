import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, CheckCircle2, AlertTriangle, HelpCircle, Loader2, Mail, User, Info } from 'lucide-react';

interface SupportWidgetProps {
  user: any | null;
  profile: any | null;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export default function SupportWidget({ user, profile, isOpenExternal, onCloseExternal }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('General Inquiry');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize internal state with external control if provided
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Pre-fill user details when they log in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    } else {
      setName('');
      setEmail('');
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) {
      onCloseExternal();
    }
    // Only reset status on close if it was a success or error
    if (submitStatus !== 'idle') {
      setTimeout(() => {
        setSubmitStatus('idle');
        setMessage('');
        setCategory('General Inquiry');
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      setSubmitStatus('error');
      setErrorMessage('Please fill in both your email address and message.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Prepare payload with hidden metadata to give formspree recipients rich context
    const payload = {
      name: name || 'Anonymous Visitor',
      email: email,
      category: category,
      message: message,
      _subject: `New OpenLabs Support Ticket: [${category}] from ${name || email}`,
      // Contextual metadata
      authenticated: user ? 'Yes' : 'No',
      userRole: user?.role || 'Guest',
      userId: user?.id || 'N/A',
      studentId: profile?.studentId || 'N/A',
      department: profile?.department || 'N/A',
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch('https://formspree.io/f/mwvgbgqq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setMessage('');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit the form. Please try again.');
      }
    } catch (err: any) {
      console.error('Formspree submission error:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || 'Unable to establish connection to Formspree servers. Check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      {/* Floating Action Button */}
      <motion.button
        type="button"
        id="floating-support-btn"
        onClick={() => {
          if (isOpenExternal !== undefined && onCloseExternal) {
            if (isOpen) onCloseExternal();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all relative group cursor-pointer ${
          isOpen 
            ? 'bg-slate-900 text-white border-2 border-slate-800' 
            : 'bg-[#FF7A00] text-white hover:bg-orange-600 shadow-orange-500/20'
        }`}
        title="Contact Support & Feedback"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={22} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#FF7A00] animate-pulse"></span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hover Tooltip label */}
        {!isOpen && (
          <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase rounded-xl shadow-xl border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Help &amp; Feedback Form
          </span>
        )}
      </motion.button>

      {/* Fly-out / Slide-up Support Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute bottom-18 right-0 w-[350px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100/90 overflow-hidden"
          >
            {/* Header Area */}
            <div className="bg-slate-900 p-5 text-white relative">
              {/* Background glows */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-[#FF7A00]/15 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-orange-500/10 border border-[#FF7A00]/30 rounded-xl text-[#FF7A00]">
                  <HelpCircle size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight uppercase">OpenLabs Support</h3>
                  <p className="text-[11px] text-gray-400">Direct Formspree Feedback Channel</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inner Content panels */}
            <div className="p-5 max-h-[450px] overflow-y-auto">
              {submitStatus === 'success' ? (
                /* Success Message screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center text-center"
                >
                  <div className="p-4 bg-green-50 border border-green-100 text-green-500 rounded-full mb-4 animate-bounce">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-base font-black text-gray-900 tracking-tight">Message Dispatched!</h4>
                  <p className="text-xs text-gray-500 mt-2 max-w-[250px] leading-relaxed">
                    Thank you. Your feedback has been securely forwarded to Formspree endpoint <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px] text-orange-600">mwvgbgqq</code>.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => setSubmitStatus('idle')}
                    className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                /* Main Feedback Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Submission Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950 bg-white"
                    >
                      <option value="General Inquiry">General Inquiry &amp; Questions</option>
                      <option value="Attendance Dispute">Attendance Dispute / Check-in issue</option>
                      <option value="Report Bug">Technical Problem / Bug Report</option>
                      <option value="Lecturer Request">Request Lecturer Credentials</option>
                      <option value="Feature Feedback">System Suggestion / Feedback</option>
                    </select>
                  </div>

                  {/* Name field (if not pre-filled/anonymous) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <User size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Abena Osei (or leave blank)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Mail size={14} />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="e.g. student@openlabs.edu.gh"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950"
                      />
                    </div>
                  </div>

                  {/* Message box */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      How can we help? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Type details here... (e.g. My attendance wasn't logged for Java course today)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none transition-all text-gray-950 resize-none min-h-[80px]"
                    />
                  </div>

                  {/* User status tracker banner in widget */}
                  {user && (
                    <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                      <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <div className="text-[10px] text-slate-500 font-medium leading-normal">
                        Logged in as <strong className="text-slate-700">{user.name}</strong> ({user.role}). Your registration and student/lecturer ID details will automatically accompany this ticket.
                      </div>
                    </div>
                  )}

                  {/* Error Notification inside Form */}
                  {submitStatus === 'error' && (
                    <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-700 text-[11px] font-semibold leading-relaxed">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action/Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#FF7A00] hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Connecting Formspree...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                  
                  {/* Formspree policy watermark */}
                  <div className="text-[9px] text-gray-400 text-center font-medium">
                    Protected by Formspree API Endpoint <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px] text-orange-600 font-bold">mwvgbgqq</code>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
