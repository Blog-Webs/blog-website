'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, Upload, FileText, Image as ImageIcon, FileCode, HardDrive, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import studentOSApi from '@/lib/studentOSApi';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'img' | 'code';
  date: string;
}

const DEFAULT_FILES: FileItem[] = [
  { id: 'f-1', name: 'Distributed_Systems_Paxos_Notes.pdf', size: '2.4 MB', type: 'pdf', date: 'Aug 21, 2026' },
  { id: 'f-2', name: 'Machine_Learning_Transformer_Summary.pdf', size: '4.1 MB', type: 'pdf', date: 'Aug 19, 2026' },
  { id: 'f-3', name: 'System_Architecture_Diagram.png', size: '850 KB', type: 'img', date: 'Aug 15, 2026' },
  { id: 'f-4', name: 'Consensus_State_Machine.js', size: '12 KB', type: 'code', date: 'Aug 10, 2026' },
];

export default function DrivePage() {
  const [files, setFiles] = useState<FileItem[]>(DEFAULT_FILES);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    studentOSApi.getDriveFiles()
      .then((data) => {
        if (data?.files && Array.isArray(data.files) && data.files.length > 0) {
          setFiles(data.files.map((f: any) => ({
            id: f.id || f._id,
            name: f.name || f.filename,
            size: f.size || '1.2 MB',
            type: (f.name || '').endsWith('.png') || (f.name || '').endsWith('.jpg') ? 'img' : (f.name || '').endsWith('.js') || (f.name || '').endsWith('.py') ? 'code' : 'pdf',
            date: f.createdDate || f.modifiedDate || 'Recent',
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    try {
      const res = await studentOSApi.uploadDocument(selectedFile);
      const newFileItem: FileItem = {
        id: res?.doc?.id || `f-${Date.now()}`,
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        type: selectedFile.name.endsWith('.pdf') ? 'pdf' : selectedFile.name.match(/\.(png|jpg|jpeg)$/) ? 'img' : 'code',
        date: 'Just now',
      };
      setFiles((prev) => [newFileItem, ...prev]);
    } catch {
      // Optimistic upload addition
      const newFileItem: FileItem = {
        id: `f-${Date.now()}`,
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        type: selectedFile.name.endsWith('.pdf') ? 'pdf' : selectedFile.name.match(/\.(png|jpg|jpeg)$/) ? 'img' : 'code',
        date: 'Just now',
      };
      setFiles((prev) => [newFileItem, ...prev]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="text-purple-400" /> Academic Drive
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Cloud document previews and assignment storage.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {loading && <RefreshCw size={16} className="animate-spin text-purple-400" />}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="apple"
            className="gap-2"
          >
            {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <HardDrive className="text-blue-400" size={24} />
          <div>
            <p className="text-xs text-zinc-400">Used Storage</p>
            <p className="text-sm font-bold text-white">8.36 MB / 5.0 GB</p>
          </div>
        </div>
        <Progress value={10} className="w-full sm:w-64" />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="p-4 hover:border-purple-500/50 flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-purple-400">
                {file.type === 'pdf' && <FileText size={20} />}
                {file.type === 'img' && <ImageIcon size={20} />}
                {file.type === 'code' && <FileCode size={20} />}
              </div>
              <span className="text-[10px] text-zinc-500">{file.date}</span>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-white truncate">{file.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{file.size}</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full text-xs text-purple-300"
              onClick={() => alert(`Previewing ${file.name}`)}
            >
              Instant Preview
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

