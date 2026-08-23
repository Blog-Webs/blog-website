'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FolderOpen, Upload, FileText, Image as ImageIcon, FileCode, HardDrive, RefreshCw, ExternalLink, Eye, X, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  fileType: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  isNew?: boolean;
};

type StorageQuota = {
  usedGB: string;
  totalGB: string;
  percentUsed: number;
};

export default function DrivePage() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [preview, setPreview] = useState<DriveFile | null>(null);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async (q?: string) => {
    setSearching(!!q);
    setLoading(!q);
    try {
      const endpoint = q ? `/student-os/drive/search?q=${encodeURIComponent(q)}` : '/student-os/drive/files';
      const res = await api.get(endpoint);
      setFiles(res.data?.files || []);
    } catch { setFiles([]); }
    finally { setLoading(false); setSearching(false); }
  }, []);

  const fetchQuota = useCallback(async () => {
    try {
      const res = await api.get('/student-os/drive/storage');
      setQuota(res.data?.quota || null);
    } catch {}
  }, []);

  useEffect(() => { fetchFiles(); fetchQuota(); }, [fetchFiles, fetchQuota]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchFiles(search.trim() || undefined); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/student-os/drive/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.file) setFiles(prev => [res.data.file, ...prev]);
      fetchQuota();
    } catch (err: any) {
      alert('Upload failed: ' + (err?.response?.data?.message || err.message));
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const getFileIcon = (f: DriveFile) => {
    if (['image/png','image/jpeg'].includes(f.mimeType)) return <ImageIcon size={20} className="text-pink-400" />;
    if (['text/x-python','application/javascript','text/plain'].includes(f.mimeType)) return <FileCode size={20} className="text-cyan-400" />;
    return <FileText size={20} className="text-purple-400" />;
  };

  const canPreview = (f: DriveFile) => !!f.webViewLink;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="text-purple-400" /> Academic Drive
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Cloud document storage powered by Google Drive.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button onClick={() => fetchFiles()} variant="ghost" size="icon" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="apple" className="gap-2">
            {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Uploading to Drive...' : 'Upload to Drive'}
          </Button>
        </div>
      </div>

      {/* Storage Quota */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <HardDrive className="text-blue-400 shrink-0" size={24} />
          <div>
            <p className="text-xs text-zinc-400">Google Drive Storage</p>
            {quota ? (
              <p className="text-sm font-bold text-white">{quota.usedGB} GB / {quota.totalGB} GB</p>
            ) : (
              <p className="text-sm font-bold text-zinc-500">Loading quota...</p>
            )}
          </div>
        </div>
        <div className="flex-1">
          <Progress value={quota?.percentUsed ?? 0} className="h-2" />
          <p className="text-[10px] text-zinc-500 mt-1">{quota?.percentUsed ?? 0}% used</p>
        </div>
      </Card>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents in Drive..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </Button>
        {search && <Button type="button" variant="ghost" onClick={() => { setSearch(''); fetchFiles(); }}>Clear</Button>}
      </form>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Card key={i} className="h-44 animate-pulse bg-zinc-900" />)}
        </div>
      ) : files.length === 0 ? (
        <Card className="p-12 text-center text-zinc-500 text-sm">No documents found in your Google Drive.</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map(file => (
            <Card key={file.id} className="p-4 hover:border-purple-500/50 flex flex-col justify-between group transition-all">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  {file.thumbnailLink ? (
                    <img src={file.thumbnailLink} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : getFileIcon(file)}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-[9px] py-0">{file.fileType}</Badge>
                  {file.isNew && <Badge variant="apple" className="text-[9px] py-0">New</Badge>}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold text-white truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{file.size || 'Unknown size'}</p>
              </div>

              {/* Drive path link */}
              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 truncate"
                >
                  <ExternalLink size={10} /> drive.google.com
                </a>
              )}

              <div className="mt-3 flex gap-2">
                {canPreview(file) && (
                  <Button variant="secondary" size="sm" className="flex-1 text-xs gap-1" onClick={() => setPreview(file)}>
                    <Eye size={12} /> Preview
                  </Button>
                )}
                {file.webViewLink && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 text-purple-300"
                    onClick={() => window.open(file.webViewLink, '_blank')}
                  >
                    <ExternalLink size={12} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <p className="text-sm font-bold text-white truncate">{preview.name}</p>
                {preview.webViewLink && (
                  <a href={preview.webViewLink} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <ExternalLink size={10} /> Open in Google Drive
                  </a>
                )}
              </div>
              <button onClick={() => setPreview(null)} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={preview.webViewLink?.replace('/view', '/preview') || preview.webViewLink}
                className="w-full h-full min-h-[500px] border-0"
                title={preview.name}
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}