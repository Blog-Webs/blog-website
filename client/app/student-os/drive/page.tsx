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
    if (['image/png','image/jpeg'].includes(f.mimeType)) return <ImageIcon size={18} className="text-pink-500" />;
    if (['text/x-python','application/javascript','text/plain'].includes(f.mimeType)) return <FileCode size={18} className="text-blue-600" />;
    return <FileText size={18} className="text-purple-600" />;
  };

  const canPreview = (f: DriveFile) => !!f.webViewLink;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <FolderOpen className="text-blue-600" size={20} /> Academic Drive
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Cloud document storage synchronized with Google Workspace.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button 
            onClick={() => fetchFiles()} 
            disabled={loading} 
            className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading} 
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
          >
            {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Uploading to Drive...' : 'Upload File'}
          </button>
        </div>
      </div>

      {/* Storage Quota */}
      <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <HardDrive size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Drive Quota</p>
            {quota ? (
              <p className="text-xs font-semibold text-gray-900">{quota.usedGB} GB / {quota.totalGB} GB</p>
            ) : (
              <p className="text-xs font-medium text-gray-400">Loading quota...</p>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${quota?.percentUsed ?? 0}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1 font-mono">{quota?.percentUsed ?? 0}% used</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents in Drive..."
            className="pl-9 h-9 rounded-md border-gray-300 bg-white text-xs placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>
        <button 
          type="submit" 
          disabled={searching} 
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
        {search && (
          <button 
            type="button" 
            onClick={() => { setSearch(''); fetchFiles(); }} 
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-40 rounded-lg animate-pulse bg-gray-100 border border-gray-200" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="p-12 text-center text-gray-500 text-xs bg-white rounded-lg border border-gray-200 shadow-xs">
          No documents found in your Google Drive.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map(file => (
            <div key={file.id} className="p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xs flex flex-col justify-between group transition-all">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    {file.thumbnailLink ? (
                      <img src={file.thumbnailLink} alt="" className="w-8 h-8 rounded-md object-cover" />
                    ) : getFileIcon(file)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">{file.fileType}</span>
                    {file.isNew && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-medium">New</span>}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{file.size || 'Cloud Document'}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {canPreview(file) ? (
                  <button 
                    onClick={() => setPreview(file)}
                    className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium shadow-xs transition-colors"
                  >
                    <Eye size={12} /> Preview
                  </button>
                ) : <div className="flex-1" />}
                {file.webViewLink && (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md border border-gray-300 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    title="Open in Google Drive"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enlarged High-Resolution Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[88vh] bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-blue-600 shrink-0">
                  {getFileIcon(preview)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate max-w-[400px]">{preview.name}</p>
                  <p className="text-[10px] font-mono text-gray-500">{preview.fileType} · {preview.size || 'Google Cloud'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {preview.webViewLink && (
                  <a
                    href={preview.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md text-xs font-medium shadow-xs transition-colors"
                  >
                    <ExternalLink size={12} /> Open in Drive
                  </a>
                )}
                <button
                  onClick={() => setPreview(null)}
                  className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 p-2 overflow-hidden flex items-center justify-center">
              {['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(preview.mimeType) ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={preview.thumbnailLink?.replace(/=s\d+/, '=s1600') || preview.webContentLink || preview.webViewLink}
                    alt={preview.name}
                    className="max-h-[76vh] max-w-full object-contain rounded-md shadow-md border border-gray-200"
                  />
                </div>
              ) : (
                <iframe
                  src={preview.webViewLink?.replace('/view', '/preview') || preview.webViewLink}
                  className="w-full h-full border-0 rounded-md bg-white shadow-xs"
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