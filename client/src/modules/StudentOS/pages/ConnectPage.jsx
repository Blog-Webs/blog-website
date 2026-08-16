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

  /* ── Shared full-screen shell ── */
  const shell = (children) => (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'var(--sos-bg, #0b0d12)',
      backgroundImage: `
        linear-gradient(rgba(77,142,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(77,142,255,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '36px 36px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--sos-text, #e2e8f4)',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Ambient glow orbs */}
      <div style={{
        position: 'absolute', top: '-120px', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(77,142,255,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
        animation: 'blob-drift 12s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-60px',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(94,234,212,0.10) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
        animation: 'blob-drift 16s ease-in-out infinite alternate-reverse',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '15%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
        filter: 'blur(30px)', pointerEvents: 'none',
        animation: 'blob-drift 20s ease-in-out infinite alternate',
      }} />
      {children}
    </div>
  );

  /* ── Logo icon ── */
  const LogoIcon = ({ size = 72 }) => (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: 'linear-gradient(135deg, #4d8eff 0%, #5EEAD4 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 40px rgba(77,142,255,0.4), 0 0 80px rgba(77,142,255,0.15), 0 0 0 1px rgba(77,142,255,0.3)',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
      animation: 'blob-drift 10s ease-in-out infinite alternate',
    }}>
      {/* Shimmer sweep */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer-sweep 3s ease-in-out infinite',
        borderRadius: 'inherit',
      }} />
      <Zap size={size * 0.44} color="white" style={{ position: 'relative', zIndex: 1 }} />
    </div>
  );

  /* ── NOT LOGGED IN state ── */
  if (!user) {
    return shell(
      <div style={{
        maxWidth: 420, width: '100%', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
      }}>
        <LogoIcon size={80} />

        <div>
          <h1 style={{
            fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em',
            fontFamily: "'Geist', sans-serif", lineHeight: 1.1, marginBottom: 10,
            background: 'linear-gradient(135deg, #e2e8f4 0%, #adc6ff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>StudentOS</h1>
          <p style={{
            fontSize: 15, color: 'var(--sos-text-subtle, #8a9bbf)',
            lineHeight: 1.6, marginBottom: 0,
          }}>
            Your AI-powered Academic Hub — sign in to httpTechNex to get started.
          </p>
        </div>

        {/* Glass sign-in card */}
        <div style={{
          width: '100%',
          background: 'rgba(20,24,36,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(77,142,255,0.18)',
          borderRadius: 20,
          padding: '28px 24px',
          boxShadow: '0 0 40px -12px rgba(77,142,255,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Shimmer top line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(77,142,255,0.5), rgba(94,234,212,0.4), transparent)',
          }} />
          <p style={{ fontSize: 13, color: 'var(--sos-text-muted, #56647a)', textAlign: 'center' }}>
            Sign in with your Google account to continue
          </p>
          <GoogleSignInButton />
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: Shield, text: 'AES-256 Encrypted' },
            { icon: Zap, text: 'AI-Enhanced' },
            { icon: Brain, text: 'Smart Insights' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
              color: 'var(--sos-text-muted, #56647a)', fontWeight: 500 }}>
              <Icon size={12} style={{ color: '#5EEAD4' }} />
              {text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── LOGGED IN, NOT CONNECTED state ── */
  return shell(
    <div style={{ maxWidth: 680, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <LogoIcon size={88} />

        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 14px', borderRadius: 99,
            background: 'rgba(77,142,255,0.10)', border: '1px solid rgba(77,142,255,0.20)',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#4d8eff', marginBottom: 14,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <Zap size={10} /> Academic Operating System
          </div>

          <h1 style={{
            fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em',
            fontFamily: "'Geist', sans-serif", lineHeight: 1.05, marginBottom: 12,
            background: 'linear-gradient(135deg, #e2e8f4 0%, #adc6ff 60%, #5EEAD4 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: 'drop-shadow(0 0 24px rgba(77,142,255,0.2))',
          }}>StudentOS</h1>

          <p style={{ fontSize: 15, color: 'var(--sos-text-subtle, #8a9bbf)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Connect your Google Workspace to unlock Classroom, Drive, Gmail, Calendar,
            and Tasks — all in one place, supercharged by AI.
          </p>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 14,
          border: '1px solid rgba(248,113,113,0.3)',
          background: 'rgba(248,113,113,0.08)', color: '#F87171',
          fontSize: 13, width: '100%',
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error === 'access_denied' ? 'You declined access. Please try again.' :
           error === 'user_not_found' ? 'Account mismatch. Sign in with the same Google account.' :
           'Connection failed. Please try again.'}
        </div>
      )}

      {/* ── Feature grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, width: '100%' }}>
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label}
            style={{
              padding: '18px 16px',
              background: 'rgba(20,24,36,0.70)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(77,142,255,0.12)',
              borderRadius: 16,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(77,142,255,0.30)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(77,142,255,0.28), inset 0 1px 0 rgba(255,255,255,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(77,142,255,0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)';
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, marginBottom: 12,
              background: 'rgba(77,142,255,0.12)',
              border: '1px solid rgba(77,142,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#4d8eff',
              boxShadow: '0 0 12px rgba(77,142,255,0.15)',
            }}>
              <Icon size={17} />
            </div>
            <p style={{
              fontSize: 13, fontWeight: 700, color: '#e2e8f4', marginBottom: 4,
              fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em',
            }}>{label}</p>
            <p style={{ fontSize: 11.5, color: 'var(--sos-text-muted, #56647a)', lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── Privacy note ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 18px', borderRadius: 14, width: '100%',
        background: 'rgba(20,24,36,0.60)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(94,234,212,0.12)',
        boxShadow: 'inset 0 1px 0 rgba(94,234,212,0.05)',
      }}>
        <Shield size={15} style={{ color: '#5EEAD4', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: 'var(--sos-text-muted, #56647a)', lineHeight: 1.65, margin: 0 }}>
          <strong style={{ color: '#8a9bbf' }}>Your data is private.</strong>{' '}
          OAuth tokens are AES-256 encrypted before storage. We only read your Google data to display it — we never sell or share it. You can disconnect at any time.
        </p>
      </div>

      {/* ── CTA ── */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <button
          onClick={connect}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 32px', borderRadius: 16,
            background: 'linear-gradient(135deg, #4d8eff 0%, #5EEAD4 100%)',
            color: '#07090f', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
            fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em',
            boxShadow: '0 4px 28px rgba(77,142,255,0.45), 0 0 0 1px rgba(77,142,255,0.3)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(77,142,255,0.55), 0 0 0 1px rgba(77,142,255,0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 28px rgba(77,142,255,0.45), 0 0 0 1px rgba(77,142,255,0.3)';
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; }}
        >
          <Plug size={18} />
          Connect Google Workspace
        </button>
        <p style={{ fontSize: 11, color: 'var(--sos-text-muted, #56647a)', margin: 0 }}>
          Requires Gmail, Drive, Classroom, Calendar &amp; Tasks access
        </p>
      </div>
    </div>
  );
};

export default ConnectPage;
