import { useEffect, useState } from 'react';
import { Search, ExternalLink, Download, FileText, Presentation, Sheet, File, FileCode } from 'lucide-react';
import { studentOSApi } from '../api';

const FILE_ICONS = {
  PDF: FileText,
  PPT: Presentation,
  PPTX: Presentation,
  Slides: Presentation,
  DOC: FileText,
  DOCX: FileText,
  Doc: FileText,
  XLS: Sheet,
  XLSX: Sheet,
  Sheet: Sheet,
  DOCX: FileText,
};

const FILE_COLORS = {
  PDF: '#ef4444', // red-500
  PPT: '#eab308', // yellow-500
  PPTX: '#eab308',
  Slides: '#eab308',
  DOC: '#3b82f6', // blue-500
  DOCX: '#3b82f6',
  Doc: '#3b82f6',
  XLS: '#22c55e', // green-500
  XLSX: '#22c55e',
  Sheet: '#22c55e',
};

const Skeleton = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-44 rounded-2xl animate-pulse bg-[#161b22]" />
    ))}
  </div>
);

const DrivePage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState('All');

  const FILE_TYPES = ['All', 'PDF', 'Doc', 'Slides', 'Sheet'];

  useEffect(() => {
    studentOSApi.getFiles()
      .then(({ data }) => setFiles(data.files || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      handleReset();
      return;
    }
    setSearching(true);
    try {
      const { data } = await studentOSApi.searchFiles(search.trim());
      setFiles(data.files || []);
    } finally {
      setSearching(false);
    }
  };

  const handleReset = async () => {
    setSearch('');
    setLoading(true);
    studentOSApi.getFiles().then(({ data }) => setFiles(data.files || [])).finally(() => setLoading(false));
  };

  const filtered = filter === 'All'
    ? files
    : files.filter((f) => {
        const type = f.fileType?.toUpperCase();
        if (filter === 'Doc') return ['DOC', 'DOCX'].includes(type);
        if (filter === 'Slides') return ['PPT', 'PPTX', 'SLIDES'].includes(type);
        if (filter === 'Sheet') return ['XLS', 'XLSX', 'SHEET'].includes(type);
        return type === filter.toUpperCase();
      });

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 bg-[#0d1117] min-h-full text-white font-sans">
      <div className="space-y-1">
        <p className="text-sm font-mono text-gray-500">// google.drive</p>
        <h1 className="text-4xl font-bold tracking-tight text-white">Drive</h1>
        <p className="text-gray-400 text-sm">PDFs, presentations, documents, and spreadsheets</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 items-center">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <Search size={18} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files in your Drive..."
            className="flex-1 bg-transparent text-sm text-gray-300 outline-none placeholder-gray-600"
          />
        </div>
        <button type="submit" disabled={searching}
          className="px-8 py-3 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors">
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-1 items-center pb-2">
        {FILE_TYPES.map((t) => (
          <button 
            key={t} 
            onClick={() => setFilter(t)}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filter === t 
                ? 'bg-[#30363d] text-white' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? <Skeleton /> : (
        filtered.length === 0
          ? <div className="text-center py-20"><p className="text-gray-500">No files found matching your criteria</p></div>
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((f) => {
                const IconComp = FILE_ICONS[f.fileType] || File;
                const color = FILE_COLORS[f.fileType] || '#8b5cf6';
                
                return (
                  <div key={f.id} className="group p-5 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#4b5563] transition-all flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}15`, color }}>
                        <IconComp size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase"
                        style={{ color }}>
                        {f.fileType}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-gray-200 line-clamp-1 group-hover:text-white transition-colors" title={f.name}>
                        {f.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {f.size || 'Unknown size'} • {new Date(f.modifiedTime).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#30363d] flex items-center gap-5">
                      <a href={f.webViewLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-gray-200 transition-colors">
                        <ExternalLink size={12} strokeWidth={2.5} /> Open
                      </a>
                      {f.webContentLink && (
                        <a href={f.webContentLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-gray-200 transition-colors">
                          <Download size={12} strokeWidth={2.5} /> Download
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
      )}
    </div>
  );
};

export default DrivePage;
