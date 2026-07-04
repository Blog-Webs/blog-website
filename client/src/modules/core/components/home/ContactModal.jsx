import { useState } from 'react';
import { X, Bug, LifeBuoy, Star, Send, CheckCircle2 } from 'lucide-react';
import { contactApi } from '../../../../api/contact';

const TYPES = [
  { key: 'bug', label: 'Bug report', icon: Bug },
  { key: 'support', label: 'Support', icon: LifeBuoy },
  { key: 'review', label: 'Review', icon: Star },
];

const emptyForm = { name: '', email: '', subject: '', message: '', role: '', review: '' };

const fieldClass = 'w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none input-focus';
const fieldStyle = { backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', color: 'var(--text)' };

const ContactModal = ({ onClose }) => {
  const [type, setType] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await contactApi.submit({ type, ...form });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setType(null);
    setForm(emptyForm);
    setDone(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={resetAndClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 20px 60px var(--shadow)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm">
            {type ? TYPES.find((t) => t.key === type)?.label : 'How can we help?'}
          </p>
          <button onClick={resetAndClose} aria-label="Close" className="btn-press" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle2 size={36} className="mx-auto mb-3" style={{ color: 'var(--accent)' }} />
              <p className="font-medium mb-1">Thanks — we've received it.</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>We'll get back to you if needed.</p>
              <button
                onClick={resetAndClose}
                className="mt-5 px-4 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
              >
                Close
              </button>
            </div>
          ) : !type ? (
            <div className="grid grid-cols-3 gap-3">
              {TYPES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border card-hover"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Icon size={20} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs font-medium text-center">{label}</span>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input required value={form.name} onChange={update('name')} placeholder="Your name" className={fieldClass} style={fieldStyle} />
              <input required type="email" value={form.email} onChange={update('email')} placeholder="Your email" className={fieldClass} style={fieldStyle} />

              {type === 'review' ? (
                <>
                  <input
                    required
                    value={form.role}
                    onChange={update('role')}
                    placeholder="Your role (e.g. Student, SDE-1, College Senior)"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                  <textarea
                    required
                    rows={4}
                    value={form.review}
                    onChange={update('review')}
                    placeholder="Your review"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </>
              ) : (
                <>
                  <input
                    required
                    value={form.subject}
                    onChange={update('subject')}
                    placeholder={type === 'support' ? 'Want to contribute on your project?' : 'Subject'}
                    className={fieldClass}
                    style={fieldStyle}
                  />
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={update('message')}
                    placeholder={type === 'support' ? 'I really want to contribute on your website' : 'Describe the issue in detail…'}
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </>
              )}

              {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

              <div className="flex items-center justify-between mt-1">
                <button type="button" onClick={() => setType(null)} className="text-xs btn-press" style={{ color: 'var(--text-muted)' }}>
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
                >
                  <Send size={14} /> {type === 'review' ? 'Submit' : 'Send'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
