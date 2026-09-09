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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderOpen className="text-blue-600" /> Academic Drive
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cloud document storage powered by Google Drive.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button onClick={() => fetchFiles()} variant="ghost" size="icon" disabled={loading} className="text-slate-600 hover:text-slate-900">
            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
            {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Uploading to Drive...' : 'Upload to Drive'}
          </Button>
        </div>
      </div>

      {/* Storage Quota */}
      <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HardDrive size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Google Drive Storage</p>
            {quota ? (
              <p className="text-sm font-bold text-slate-900">{quota.usedGB} GB / {quota.totalGB} GB</p>
            ) : (
              <p className="text-sm font-bold text-slate-400">Loading quota...</p>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${quota?.percentUsed ?? 0}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{quota?.percentUsed ?? 0}% used</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents in Drive..."
            className="pl-9 bg-white border-slate-200 focus:bg-white"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={searching} className="bg-slate-100 hover:bg-slate-200 text-slate-700">
          {searching ? 'Searching...' : 'Search'}
        </Button>
        {search && <Button type="button" variant="ghost" onClick={() => { setSearch(''); fetchFiles(); }} className="text-slate-600">Clear</Button>}
      </form>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-44 rounded-3xl animate-pulse bg-slate-200/70" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-200 shadow-xs">
          No documents found in your Google Drive.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map(file => (
            <div key={file.id} className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md flex flex-col justify-between group transition-all shadow-xs">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  {file.thumbnailLink ? (
                    <img src={file.thumbnailLink} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : getFileIcon(file)}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-[9px] py-0 bg-slate-100 text-slate-700">{file.fileType}</Badge>
                  {file.isNew && <Badge className="text-[9px] py-0 bg-blue-600 text-white border-0">New</Badge>}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-900 truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{file.size || 'Cloud Document'}</p>
              </div>

              {/* Drive path link */}
              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 truncate font-medium"
                >
                  <ExternalLink size={10} /> drive.google.com
                </a>
              )}

              <div className="mt-3 flex gap-2">
                {canPreview(file) && (
                  <Button variant="secondary" size="sm" className="flex-1 text-xs gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => setPreview(file)}>
                    <Eye size={12} /> Preview
                  </Button>
                )}
                {file.webViewLink && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => window.open(file.webViewLink, '_blank')}
                  >
                    <ExternalLink size={12} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enlarged High-Resolution Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
          <div className="w-full max-w-6xl h-[92vh] bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  {getFileIcon(preview)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[450px]">{preview.name}</p>
                  <p className="text-[11px] text-slate-500">{preview.fileType} · {preview.size || 'Google Cloud'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {preview.webViewLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8 text-blue-700 border-blue-200 hover:bg-blue-50"
                    onClick={() => window.open(preview.webViewLink, '_blank')}
                  >
                    <ExternalLink size={13} /> Open in Google Drive
                  </Button>
                )}
                <button
                  onClick={() => setPreview(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2 overflow-hidden flex items-center justify-center">
              {['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(preview.mimeType) ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={preview.thumbnailLink?.replace(/=s\d+/, '=s1600') || preview.webContentLink || preview.webViewLink}
                    alt={preview.name}
                    className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-xl border border-slate-200"
                  />
                </div>
              ) : (
                <iframe
                  src={preview.webViewLink?.replace('/view', '/preview') || preview.webViewLink}
                  className="w-full h-full border-0 rounded-2xl bg-white shadow-xs"
                  title={preview.name}
                  allow="autoplay"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}