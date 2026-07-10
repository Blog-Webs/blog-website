import { FileText, HelpCircle } from 'lucide-react';

const StickyTableOfContents = ({ headings = [], activeHeadingId, onHeadingClick }) => {
  return (
    <div className="w-full h-full flex flex-col py-8 select-none bg-[#0E1015]">
      {/* Header */}
      <div className="px-6 mb-6">
        <h3 className="text-[11px] font-bold tracking-[0.15em] text-white uppercase">
          ON THIS PAGE
        </h3>
      </div>

      {/* Headings List */}
      <nav className="px-6 mb-12">
        <div className="relative border-l border-[#2D3342] pl-4">
          <ul className="space-y-4">
            {headings.length === 0 && (
              <li className="text-sm text-on-surface-variant italic">No headings found</li>
            )}
            
            {headings.map((heading) => {
              const isActive = heading.id === activeHeadingId;
              return (
                <li key={heading.id} className="relative group">
                  {/* Active Dot / Line indicator */}
                  {isActive && (
                    <div 
                      className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-0.5 h-full py-2 bg-[#abc4ff] rounded-r-full"
                    />
                  )}
                  <button
                    onClick={() => onHeadingClick(heading.id)}
                    className="text-left w-full block transition-colors duration-200 text-[13px] leading-tight"
                    style={{
                      paddingLeft: `${(heading.level - 1) * 8}px`,
                      color: isActive ? '#abc4ff' : 'var(--on-surface-variant)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <span className="group-hover:text-white transition-colors">{heading.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* TRACK RESOURCES Card */}
      <div className="px-6 mt-auto mb-8">
        <div className="bg-[#1C202B] border border-[#2D3342] rounded-xl p-5">
          <h4 className="text-[10px] font-bold tracking-[0.15em] text-[#abc4ff] uppercase mb-4">Track Resources</h4>
          <div className="space-y-3">
            <a href="#" className="flex items-center gap-3 text-[13px] text-on-surface-variant hover:text-white transition-colors group">
              <FileText size={14} className="text-on-surface-variant group-hover:text-white transition-colors" />
              <span>JVM Spec PDF</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-[13px] text-on-surface-variant hover:text-white transition-colors group">
              <HelpCircle size={14} className="text-on-surface-variant group-hover:text-white transition-colors" />
              <span>Chapter Quiz</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyTableOfContents;
