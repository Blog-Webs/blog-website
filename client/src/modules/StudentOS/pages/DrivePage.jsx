import { useEffect, useState } from 'react';
import { FolderOpen, Search, ExternalLink, Download, FileText, Presentation, Sheet, File } from 'lucide-react';
import SearchForm from '../components/SearchForm';
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
};

const FILE_COLORS = {
  PDF: '#F87171',
  PPT: '#FFB454',
  PPTX: '#FFB454',
  Slides: '#FFB454',
  DOC: '#60A5FA',
  DOCX: '#60A5FA',
  Doc: '#60A5FA',
  XLS: '#34D399',
  XLSX: '#34D399',
  Sheet: '#34D399',
};

const Skeleton = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(9)].map((_, i) => (
      <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--surface)' }} />
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
    if (!search.trim()) return;
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
    : files.filter((f) => f.fileType === filter || (filter === 'Doc' && ['Doc', 'DOC', 'DOCX'].includes(f.fileType)));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>// google.drive</p>
        <h1 className="text-2xl font-bold">Drive</h1>
        <p style={{ color: 'var(--text-muted)' }}>PDFs, presentations, documents, and spreadsheets</p>
      </div>

      {/* Search */}
      <SearchForm 
        search={search} 
        setSearch={setSearch} 
        handleSearch={handleSearch} 
        handleReset={handleReset} 
        searching={searching} 
        placeholder="Search files in your Drive..." 
      />

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {FILE_TYPES.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className="px-3 py-1.5 rounded-full text-xs font-medium btn-press transition-all"
            style={{
              backgroundColor: filter === t ? 'var(--accent)' : 'var(--surface)',
              color: filter === t ? 'var(--bg)' : 'var(--text-muted)',
              border: `1px solid ${filter === t ? 'var(--accent)' : 'var(--border)'}`,
            }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <Skeleton /> : (
        filtered.length === 0
          ? <div className="text-center py-16"><p style={{ color: 'var(--text-muted)' }}>No files found</p></div>
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((f) => {
                const IconComp = FILE_ICONS[f.fileType] || File;
                const color = FILE_COLORS[f.fileType] || 'var(--accent)';
                return (
                  <div key={f.id} className="group p-4 rounded-2xl border card-hover flex flex-col gap-3"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: color + '20', color }}>
                          <IconComp size={17} />
                        </div>
                        <span className="text-[10px] font-bold font-mono-display px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: color + '20', color }}>
                          {f.fileType}
                        </span>
                      </div>
                      {f.isNew && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: '#5EEAD4', color: '#0f172a' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-2 leading-snug">{f.name}</p>
                    {f.size && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {f.size} · {new Date(f.modifiedTime).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <a href={f.webViewLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-press"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <ExternalLink size={11} /> Open
                      </a>
                      {f.webContentLink && (
                        <a href={f.webContentLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-press"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          <Download size={11} /> Download
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
