import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { contactApi } from '../api/contact';
import { 
  Mail, 
  LifeBuoy, 
  Bug, 
  Star, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  GitBranch, 
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  {
    key: 'support',
    title: 'General & Support',
    desc: 'Assistance with courses, platform questions, or account help',
    icon: LifeBuoy,
    accent: '#3B82F6',
    borderActive: 'border-blue-500/50 bg-blue-500/10 text-blue-400'
  },
  {
    key: 'bug',
    title: 'Report an Issue',
    desc: 'Found a glitch, broken code snippet, or UI bug? Let us know',
    icon: Bug,
    accent: '#EF4444',
    borderActive: 'border-red-500/50 bg-red-500/10 text-red-400'
  },
  {
    key: 'review',
    title: 'Share a Review',
    desc: 'Leave a testimonial or feedback about your learning journey',
    icon: Star,
    accent: '#F59E0B',
    borderActive: 'border-amber-500/50 bg-amber-500/10 text-amber-400'
  }
];

const FAQS = [
  {
    q: 'How fast do you respond to inquiries?',
    a: 'Our team typically reviews and responds to incoming requests within 12–24 business hours.'
  },
  {
    q: 'Can I contribute tutorials or course material?',
    a: 'Absolutely! Send us a support inquiry with your proposed topic, outline, or repository link.'
  },
  {
    q: 'Where do I report platform bugs or security concerns?',
    a: 'Select the "Report an Issue" category above, or email our dedicated engineering inbox directly at support@httptechnex.online.'
  }
];

const ContactPage = () => {
  const { user } = useAuth();

  const [type, setType] = useState('support');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    role: '',
    review: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Auto-fill logged in user info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        type,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      if (type === 'review') {
        payload.role = formData.role.trim();
        payload.review = formData.review.trim();
      } else {
        payload.subject = formData.subject.trim();
        payload.message = formData.message.trim();
      }

      await contactApi.submit(payload);
      setSuccess(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit. Please check your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setErrorMsg(null);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      message: '',
      role: '',
      review: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white selection:bg-[#00a86b]/30">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-48 right-1/4 w-[450px] h-[350px] bg-blue-500/10 blur-[140px] pointer-events-none rounded-full" />

      <main className="max-w-[1240px] mx-auto px-6 pt-16 pb-24 relative z-10">
        {/* Header Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00a86b] text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles size={13} />
            We&apos;re Here to Help
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-4">
            Get in touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a86b] via-emerald-400 to-blue-400">httpTechNex</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Have a question, feedback, or need technical support? Send us a message and our engineering team will get back to you shortly.
          </p>
        </div>

        {/* Main Grid: Info Cards (Left) & Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Quick Info & Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Card */}
            <div className="p-7 rounded-2xl bg-[#0F131D]/80 border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#00a86b]" />
                Direct Communication
              </h2>

              <div className="space-y-5">
                {/* Email Box */}
                <a 
                  href="mailto:support@httptechnex.online" 
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group/item"
                  id="direct-email-link"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-[#00a86b] shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Official Email</span>
                    <span className="text-sm font-medium text-white group-hover/item:text-[#00a86b] transition-colors flex items-center gap-1.5 mt-0.5">
                      support@httptechnex.online
                      <ExternalLink size={12} className="opacity-60" />
                    </span>
                  </div>
                </a>

                {/* GitHub Box */}
                <a 
                  href="https://github.com/Blog-Webs/blog-website" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all group/item"
                  id="direct-github-link"
                >
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                    <GitBranch size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Open Source Repository</span>
                    <span className="text-sm font-medium text-white group-hover/item:text-blue-400 transition-colors flex items-center gap-1.5 mt-0.5">
                      github.com/Blog-Webs/blog-website
                      <ExternalLink size={12} className="opacity-60" />
                    </span>
                  </div>
                </a>

                {/* SLA / Operational Status */}
                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <span className="text-[11px] text-gray-500 block font-medium">Response SLA</span>
                      <span className="text-xs text-gray-200 font-semibold">&lt; 24h Average</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-[#00a86b]" />
                    <div>
                      <span className="text-[11px] text-gray-500 block font-medium">Platform Status</span>
                      <span className="text-xs text-emerald-400 font-semibold">100% Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs Box */}
            <div className="p-7 rounded-2xl bg-[#0F131D]/80 border border-white/5 backdrop-blur-xl shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5 flex items-center gap-2">
                <HelpCircle size={16} className="text-blue-400" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs font-semibold text-white mb-1.5">{faq.q}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 rounded-2xl bg-[#0F131D]/90 border border-white/5 backdrop-blur-xl shadow-2xl relative">
              
              {success ? (
                /* Success View */
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#00a86b] flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-display">
                    Message Delivered Successfully!
                  </h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                    Thank you for reaching out. We have received your submission and an automated confirmation email has been dispatched. Our team will review it shortly.
                  </p>
                  <button
                    onClick={handleReset}
                    id="submit-another-btn"
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/10"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* Active Form */
                <form onSubmit={handleSubmit} className="space-y-6" id="contact-form">
                  
                  {/* Category Selector Tabs */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
                      Select Topic Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = type === cat.key;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setType(cat.key)}
                            id={`category-btn-${cat.key}`}
                            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              isSelected 
                                ? `${cat.borderActive} shadow-lg ring-1 ring-white/10` 
                                : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.04] hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-3">
                              <span className="font-semibold text-xs text-white">{cat.title}</span>
                              <Icon size={16} style={{ color: isSelected ? cat.accent : '#9CA3AF' }} />
                            </div>
                            <span className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                              {cat.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="text-xs font-bold text-gray-300 block mb-2">
                        Your Name <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange('name')}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-4 py-3 rounded-xl bg-[#090C13] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="text-xs font-bold text-gray-300 block mb-2">
                        Email Address <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange('email')}
                        placeholder="alex@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#090C13] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Dynamic Fields for Review vs Support/Bug */}
                  {type === 'review' ? (
                    <>
                      <div>
                        <label htmlFor="contact-role" className="text-xs font-bold text-gray-300 block mb-2">
                          Your Role / Occupation <span className="text-amber-400">*</span>
                        </label>
                        <input
                          id="contact-role"
                          type="text"
                          required
                          value={formData.role}
                          onChange={handleChange('role')}
                          placeholder="e.g. Full-Stack Developer, Computer Science Student"
                          className="w-full px-4 py-3 rounded-xl bg-[#090C13] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-review" className="text-xs font-bold text-gray-300 block mb-2">
                          Your Testimonial / Review <span className="text-amber-400">*</span>
                        </label>
                        <textarea
                          id="contact-review"
                          rows={5}
                          required
                          value={formData.review}
                          onChange={handleChange('review')}
                          placeholder="Tell us about how httpTechNex and StudentOS have helped you learn and build..."
                          className="w-full px-4 py-3 rounded-xl bg-[#090C13] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="contact-subject" className="text-xs font-bold text-gray-300 block mb-2">
                          Subject <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          id="contact-subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleChange('subject')}
                          placeholder={
                            type === 'bug'
                              ? 'e.g. Code syntax highlighting glitch in Java chapter 3'
                              : 'e.g. Question about curriculum track updates'
                          }
                          className="w-full px-4 py-3 rounded-xl bg-[#090C13] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-message" className="text-xs font-bold text-gray-300 block mb-2">
                          Message Description <span className="text-emerald-400">*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          rows={5}
                          required
                          value={formData.message}
                          onChange={handleChange('message')}
                          placeholder={
                            type === 'bug'
                              ? 'Please describe the steps to reproduce the issue, browser version, and any error message displayed...'
                              : 'Describe your query or inquiry in detail...'
                          }
                          className="w-full px-4 py-3 rounded-xl bg-[#090C13] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Error Notification */}
                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      id="contact-submit-btn"
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#00a86b] to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {submitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          {type === 'review' ? 'Submit Review' : 'Send Message'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ContactPage;
