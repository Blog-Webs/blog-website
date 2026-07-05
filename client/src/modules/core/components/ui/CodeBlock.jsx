import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  // Extract file name if provided via className like language-java:NexServiceController.java
  let displayLanguage = language;
  let filename = null;
  if (className && className.includes(':')) {
    const parts = className.split(':');
    displayLanguage = parts[0].replace('language-', '');
    filename = parts[1];
  }

  if (inline) {
    return (
      <code className="bg-[#1f1f22] text-[#abc4ff] px-1.5 py-0.5 rounded text-[0.875em]" {...props}>
        {children}
      </code>
    );
  }

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
    <div className="relative my-8 rounded-xl overflow-hidden border border-white/5 bg-[#131315] group">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#131315]">
        <div className="flex items-center gap-3">
          {/* Mac OS window controls */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-[11px] font-mono tracking-wider text-gray-500">
            {filename || (displayLanguage ? displayLanguage.toUpperCase() : 'CODE')}
          </span>
        </div>
        
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all hover:bg-white/5 text-gray-500 hover:text-white"
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
      <div className="p-4 overflow-x-auto text-[13px] leading-[1.6] font-mono text-[#d1d5db]">
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
