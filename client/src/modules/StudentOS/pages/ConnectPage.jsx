import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Shield, Brain, BookOpen, Mail, Calendar, CheckSquare, FolderOpen, Plug, AlertCircle } from 'lucide-react';
import { useStudentOS } from '../context/StudentOSContext';
import { useAuth } from '../../core/context/AuthContext';
import GoogleSignInButton from '../../core/components/ui/GoogleSignInButton';

const FEATURES = [
  { icon: BookOpen, label: 'Google Classroom', desc: 'Courses, assignments, and teacher posts' },
  { icon: FolderOpen, label: 'Google Drive', desc: 'PDFs, presentations, and shared files' },
  { icon: Mail, label: 'Gmail', desc: 'Teacher & placement emails with AI summary' },
  { icon: Calendar, label: 'Calendar', desc: 'Schedule, exams, and Meet links' },
  { icon: CheckSquare, label: 'Tasks', desc: 'Manage your Google Tasks' },
  { icon: Brain, label: 'AI Assistant', desc: 'Chat, flashcards, quiz generation' },
];

const ConnectPage = () => {
  const { user } = useAuth();
  const { connected, statusLoading, connect, refreshStatus } = useStudentOS();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const error = params.get('error');
  const justConnected = params.get('connected') === 'true';

  useEffect(() => {
    if (justConnected) {
      refreshStatus().then(() => {
        navigate('/student-os', { replace: true });
      });
    }
  }, [justConnected, navigate, refreshStatus]);

  useEffect(() => {
    if (!statusLoading && connected) {
      navigate('/student-os', { replace: true });
    }
  }, [connected, statusLoading, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}>
            <Zap size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">StudentOS</h1>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Sign in to httpTechNex first to access StudentOS.</p>
          <GoogleSignInButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-16 flex flex-col items-center"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-2xl w-full">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 sparkle-text"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}>
            <Zap size={36} color="white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 gradient-heading-accent">StudentOS</h1>
          <p className="text-lg mb-2" style={{ color: 'var(--text)' }}>Your AI-powered Academic Hub</p>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Connect your Google Workspace to access Classroom, Drive, Gmail, Calendar, and Tasks — all in one place, enhanced by AI.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-8"
            style={{ borderColor: 'var(--danger)', backgroundColor: 'rgba(248,113,113,0.08)', color: 'var(--danger)' }}>
            <AlertCircle size={16} />
            <span className="text-sm">
              {error === 'access_denied' ? 'You declined access. Please try again.' :
               error === 'user_not_found' ? 'Account mismatch. Make sure you sign in with the same Google account.' :
               'Connection failed. Please try again.'}
            </span>
          </div>
        )}

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-2xl border card-hover"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <Icon size={18} />
              </div>
              <p className="font-semibold text-sm mb-1">{label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-3 p-4 rounded-xl border mb-8"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Shield size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <strong>Your data is private.</strong> OAuth tokens are AES-256 encrypted before storage.
            We only read your Google data to display it — we never sell or share it.
            You can disconnect at any time.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={connect}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base btn-press"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)', color: 'var(--bg)' }}
          >
            <Plug size={20} />
            Connect Google Workspace
          </button>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Requires Gmail, Drive, Classroom, Calendar, and Tasks access
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
