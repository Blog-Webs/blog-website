import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lock, ExternalLink, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import GoogleSignInButton from '../../core/components/ui/GoogleSignInButton';
import BlockNoteRenderer from '../../core/components/ui/BlockNoteRenderer';
import CodeBlock from '../../core/components/ui/CodeBlock';
import { Link } from 'react-router-dom';

const SOURCE_LABEL = {
  geeksforgeeks: 'GeeksforGeeks',
  medium: 'Medium',
  other: 'External resource',
};

const ChapterReader = ({ chapterData, subjectName, topicName, locked, onToggleStudied, onLoginSuccess }) => {
  const [busy, setBusy] = useState(false);

  if (locked) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 p-8 bg-surface-container-low mt-8">
        <div className="flex items-center gap-2 mb-4 text-[#FFBD2E]">
          <Lock size={18} />
          <p className="font-bold text-sm">Sign in to keep reading</p>
        </div>
        <p className="text-on-surface-variant leading-relaxed mb-6">{chapterData.preview}</p>
        <div className="p-6 rounded-xl border border-outline-variant/10 bg-[#161B22] text-center shadow-lg">
          <p className="text-sm mb-6 text-on-surface-variant leading-relaxed">
            This chapter and everything beyond the free preview requires a Google account.
            It only takes a few seconds — no separate password to remember.
          </p>
          <div className="flex justify-center">
            <GoogleSignInButton onSuccess={onLoginSuccess} />
          </div>
        </div>
      </div>
    );
  }

  const { chapter, studied } = chapterData;

  const handleToggleStudied = async () => {
    setBusy(true);
    await onToggleStudied(chapter._id);
    setBusy(false);
  };

  return (
    <article className="w-full max-w-[850px] mx-auto pb-16">
      
      {/* Breadcrumbs */}
      <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-on-surface-variant mb-10">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link to="/learn" className="hover:text-white transition-colors">Learning Hub</Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link to={`/learn/${subjectName?.toLowerCase()}`} className="hover:text-white transition-colors">{subjectName || 'Subject'}</Link>
      </div>

      {/* Track Label and Mark Complete Checkbox */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-[#abc4ff]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase">{subjectName}</span>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer group">
          <span className="text-sm text-on-surface-variant group-hover:text-white transition-colors">Mark as Complete</span>
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={studied || false}
              onChange={handleToggleStudied}
              disabled={busy}
            />
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              studied 
                ? 'bg-[#818CF8] border-[#818CF8]' 
                : 'border-outline-variant/30 group-hover:border-white/50 bg-transparent'
            }`}>
              {studied && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
          </div>
        </label>
      </div>
      
      {/* Chapter title */}
      <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-display font-bold text-white leading-[1.1] tracking-tight mb-12">
        {chapter.title}
      </h1>

      {/* Content */}
      <div 
        className="prose prose-invert max-w-none prose-lg font-body-lg text-on-surface-variant leading-[1.8]
          prose-p:mb-6 prose-img:rounded-xl prose-img:border prose-img:border-outline-variant/10 prose-img:shadow-lg
          prose-h2:font-display prose-h2:font-bold prose-h2:text-3xl prose-h2:text-white prose-h2:mt-16 prose-h2:mb-6
          prose-h3:font-display prose-h3:font-bold prose-h3:text-2xl prose-h3:text-white prose-h3:mt-12 prose-h3:mb-4
          prose-blockquote:bg-[#161B22] prose-blockquote:border-l-[#818CF8] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:shadow-md
          prose-pre:bg-[#111113] prose-pre:border prose-pre:border-outline-variant/20 prose-pre:rounded-xl prose-pre:p-5
          [&>p:first-of-type]:text-[19px] [&>p:first-of-type]:text-white/90
        "
      >
        {chapter.contentBlocks?.length > 0 ? (
          <BlockNoteRenderer blocks={chapter.contentBlocks} />
        ) : (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{ code: CodeBlock }}
          >
            {chapter.content}
          </ReactMarkdown>
        )}
      </div>

      {/* Code snippets (if stored separately) */}
      {chapter.codeSnippets?.length > 0 && (
        <div className="mt-12 space-y-6">
          {chapter.codeSnippets.map((snippet, i) => (
            <div key={i}>
              {snippet.caption && <p className="text-xs mb-2 text-on-surface-variant font-mono">{snippet.caption}</p>}
              <div className="bg-[#111113] border border-outline-variant/20 rounded-xl p-5 overflow-x-auto shadow-lg">
                <pre><code className="text-sm font-mono text-[#E0E0E0]">{snippet.code}</code></pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* External links */}
      {chapter.externalLinks?.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-12 pt-8 border-t border-outline-variant/10">
          <span className="w-full text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-2">External References</span>
          {chapter.externalLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-white hover:bg-surface-container transition-all shadow-sm"
            >
              {SOURCE_LABEL[link.source] || 'Resource'} <ExternalLink size={12} />
            </a>
          ))}
        </div>
      )}

    </article>
  );
};

export default ChapterReader;
