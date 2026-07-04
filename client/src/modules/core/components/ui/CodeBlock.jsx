import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // If it's an inline code snippet (e.g. `const x = 1`), just return a simple span/code
  if (inline) {
    return (
      <code className="bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.5 rounded text-[0.875em]" {...props}>
        {children}
      </code>
    );
  }

  // Otherwise, it's a fenced code block
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="relative my-6 rounded-xl overflow-hidden border shadow-lg group" style={{ borderColor: 'var(--border)', backgroundColor: '#0D1117' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-black/40 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          {/* Mac OS window controls */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20 shadow-inner" />
          </div>
          {language && (
            <span className="ml-3 text-[11px] font-mono-display tracking-wider uppercase opacity-60 text-white">
              {language}
            </span>
          )}
        </div>
        
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all hover:bg-white/10 text-white/70 hover:text-white btn-press"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#27C93F]" />
              <span className="text-[#27C93F]">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-[14px] leading-relaxed font-mono-display text-[#E6EDF3]">
        <pre className="!bg-transparent !p-0 !m-0 !border-none">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
