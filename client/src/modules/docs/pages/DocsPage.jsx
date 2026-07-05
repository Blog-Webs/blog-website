import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DOC_LINKS = [
  { title: 'User Guide', slug: 'user-guide' },
  { title: 'The Learn Platform', slug: 'learn-platform' },
  { title: 'StudentOS', slug: 'student-os' },
  { title: 'The Community Forum', slug: 'community-forum' },
  { title: 'Tech Blogs', slug: 'tech-blogs' },
  { title: 'Personalization & Account', slug: 'personalization' },
];

const mdModules = import.meta.glob('../../../../../docs/*.md', { query: '?raw', import: 'default' });

const components = {
  h1: ({node, ...props}) => <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight text-on-surface" {...props} />,
  h2: ({node, ...props}) => <h2 className="font-display text-2xl font-bold text-on-surface mt-12 mb-4" {...props} />,
  h3: ({node, ...props}) => <h3 className="font-display text-xl font-bold text-on-surface mt-8 mb-4" {...props} />,
  p: ({node, ...props}) => <p className="mb-6 leading-relaxed" {...props} />,
  ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-6 space-y-2" {...props} />,
  ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-6 space-y-2" {...props} />,
  li: ({node, ...props}) => <li className="text-on-surface-variant pl-1" {...props} />,
  strong: ({node, ...props}) => <strong className="text-on-surface font-bold" {...props} />,
  a: ({node, ...props}) => <a className="text-primary hover:underline font-medium" {...props} />,
  hr: ({node, ...props}) => <hr className="border-outline-variant/20 my-10" {...props} />,
  blockquote: ({node, ...props}) => (
    <div className="bg-[#161D2B] border border-[#20293E] border-l-4 border-l-[#64B5F6] rounded-lg p-5 flex gap-4 mt-8 mb-8">
      <span className="material-symbols-outlined text-[#64B5F6] shrink-0 mt-0.5">info</span>
      <div className="text-[#abc4ff]/90 text-sm [&>p]:mb-0 leading-relaxed" {...props} />
    </div>
  ),
  code: ({node, inline, className, children, ...props}) => {
    if (inline) {
      return (
        <code className="bg-surface-container-high text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-outline-variant/10" {...props}>
          {children}
        </code>
      );
    }
    return (
      <div className="bg-[#111113] border border-outline-variant/20 rounded-xl overflow-hidden mt-8 mb-8 shadow-lg">
        <div className="bg-[#1C1B1D] px-4 py-3 flex items-center border-b border-outline-variant/10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <div className="text-xs font-mono text-on-surface-variant/70 mx-auto">code</div>
        </div>
        <div className="p-5 overflow-x-auto hide-scrollbar">
          <pre className="font-mono text-sm leading-relaxed text-[#E0E0E0]">
            <code {...props}>{children}</code>
          </pre>
        </div>
      </div>
    );
  }
};

const DocsPage = () => {
  const { slug } = useParams();
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);

  const currentDocIndex = slug ? DOC_LINKS.findIndex(d => d.slug === slug) : 0;
  const currentDoc = currentDocIndex !== -1 ? DOC_LINKS[currentDocIndex] : DOC_LINKS[0];
  
  const prevDoc = currentDocIndex > 0 ? DOC_LINKS[currentDocIndex - 1] : null;
  const nextDoc = currentDocIndex < DOC_LINKS.length - 1 ? DOC_LINKS[currentDocIndex + 1] : null;

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    const loadContent = async () => {
      setLoading(true);
      try {
        const path = `../../../../../docs/${slug}.md`;
        if (mdModules[path]) {
          const content = await mdModules[path]();
          if (isMounted) {
            setMarkdownContent(content);
          }
        } else {
          if (isMounted) setMarkdownContent('# 404 - Document Not Found\n\nThe requested documentation page does not exist.');
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setMarkdownContent('# Error\n\nFailed to load documentation.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // If no slug, redirect to the first doc
  if (!slug) {
    return <Navigate to={`/docs/${DOC_LINKS[0].slug}`} replace />;
  }

  return (
    <div className="pt-24 pb-24 px-gutter max-w-[1200px] mx-auto flex flex-col md:flex-row gap-12 lg:gap-20">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="md:sticky md:top-24 space-y-1">
          <div className="px-4 mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
             <h3 className="font-display font-bold text-on-surface uppercase tracking-wider text-sm">Documentation</h3>
          </div>
          
          {DOC_LINKS.map(link => (
            <Link 
              key={link.slug} 
              to={`/docs/${link.slug}`}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                 slug === link.slug 
                   ? 'bg-primary/10 text-primary border border-primary/20'
                   : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-transparent'
              }`}
            >
              {link.title}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-10">
          <Link to="/docs" className="hover:text-on-surface transition-colors">DOCUMENTATION</Link>
          <span>›</span>
          <span className="text-on-surface">{currentDoc?.title || 'PAGE'}</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-surface-container rounded-lg w-3/4"></div>
            <div className="h-4 bg-surface-container rounded w-full"></div>
            <div className="h-4 bg-surface-container rounded w-5/6"></div>
            <div className="h-32 bg-surface-container rounded-xl w-full mt-8"></div>
          </div>
        ) : (
          <div className="text-on-surface-variant font-body-lg">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        )}

        {/* Pagination & Share Bottom */}
        {!loading && (
          <div className="mt-20 pt-8 border-t border-outline-variant/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
              {prevDoc ? (
                <Link to={`/docs/${prevDoc.slug}`} className="w-full sm:w-auto group flex-1 flex flex-col items-start bg-surface-container-low border border-outline-variant/10 rounded-xl p-5 hover:border-outline-variant/30 hover:bg-surface-container transition-all">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">PREVIOUS</span>
                  <span className="font-bold text-sm md:text-base text-on-surface group-hover:text-primary transition-colors">{prevDoc.title}</span>
                </Link>
              ) : (
                <div className="flex-1"></div>
              )}
              
              {nextDoc ? (
                <Link to={`/docs/${nextDoc.slug}`} className="w-full sm:w-auto group flex-1 flex flex-col items-end text-right bg-surface-container-low border border-outline-variant/10 rounded-xl p-5 hover:border-outline-variant/30 hover:bg-surface-container transition-all">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">NEXT</span>
                  <span className="font-bold text-sm md:text-base text-on-surface group-hover:text-primary transition-colors">{nextDoc.title}</span>
                </Link>
              ) : (
                <div className="flex-1"></div>
              )}
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="flex items-center gap-2 bg-[#abc4ff] hover:bg-[#b9cdff] text-[#0a0a0a] font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
                Copy Link
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default DocsPage;
