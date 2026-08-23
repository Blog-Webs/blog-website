'use client';

import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import {
  Play, Folder, FileCode, Plus, Trash2, Edit2, RefreshCw,
  Terminal, ChevronRight, ChevronDown, Save, Code2,
  FilePlus, FolderPlus, X, Check, Coffee, FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

type EditorFile = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  folderId?: string; // parent folder id
  language: string;
  content: string;
};

const DEFAULT_FILES: EditorFile[] = [
  {
    id: 'f-java-1',
    name: 'Main.java',
    type: 'file',
    language: 'java',
    content: `// StudentOS Java 15+ Interactive Compiler
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("🚀 Welcome to StudentOS Java Compiler!");
        System.out.println("========================================");

        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("Original Array: " + Arrays.toString(arr));
        
        bubbleSort(arr);
        System.out.println("Sorted Array:   " + Arrays.toString(arr));
    }

    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}
`,
  },
  {
    id: 'f-py-1',
    name: 'solution.py',
    type: 'file',
    language: 'python',
    content: `# StudentOS Python 3 Sandbox & Algorithm Suite
import sys

def fibonacci(n):
    if n <= 0: return []
    if n == 1: return [0]
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq

print("Python 3.10 Engine Active")
print("First 10 Fibonacci Numbers:", fibonacci(10))
`,
  },
  {
    id: 'f-cpp-1',
    name: 'main.cpp',
    type: 'file',
    language: 'cpp',
    content: `// StudentOS High-Performance C++ GCC Sandbox
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cout << "=== C++ 20 High Performance Container ===" << endl;
    vector<int> v = {9, 3, 7, 1, 5, 2};
    sort(v.begin(), v.end());

    cout << "Sorted Vector: ";
    for(int x : v) cout << x << " ";
    cout << endl;

    return 0;
}
`,
  },
  {
    id: 'f-js-1',
    name: 'index.js',
    type: 'file',
    language: 'javascript',
    content: `// StudentOS JavaScript (V8 Engine)
console.log("=== JavaScript Engine Online ===");

const users = [
  { id: 1, name: "Alex Chen", role: "AI Engineer", score: 98 },
  { id: 2, name: "Sara Connor", role: "Full Stack", score: 95 },
  { id: 3, name: "Dev Patel", role: "Systems Architect", score: 92 }
];

console.table(users);
console.log("Total Users Evaluated:", users.length);
`,
  },
  {
    id: 'f-go-1',
    name: 'main.go',
    type: 'file',
    language: 'go',
    content: `// StudentOS Go Concurrent Runtime
package main

import (
	"fmt"
	"time"
)

func worker(id int, ch chan string) {
	time.Sleep(100 * time.Millisecond)
	ch <- fmt.Sprintf("Worker %d completed task", id)
}

func main() {
	fmt.Println("=== Go 1.16 Concurrency Pipeline ===")
	ch := make(chan string, 3)

	for i := 1; i <= 3; i++ {
		go worker(i, ch)
	}

	for i := 1; i <= 3; i++ {
		fmt.Println(<-ch)
	}
	fmt.Println("All goroutines finished successfully!")
}
`,
  },
];

const LANG_MAP: Record<string, string> = {
  java: 'java',
  py: 'python',
  cpp: 'cpp',
  c: 'c',
  js: 'javascript',
  ts: 'typescript',
  go: 'go',
  rs: 'rust',
  html: 'html',
  css: 'css',
  json: 'json',
};

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return LANG_MAP[ext] || 'javascript';
}

function getFileBadgeColor(lang: string) {
  switch (lang) {
    case 'java': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'python': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case 'cpp': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'javascript': return 'text-amber-300 bg-amber-400/10 border-amber-400/30';
    case 'typescript': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'go': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    case 'rust': return 'text-red-400 bg-red-500/10 border-red-500/30';
    default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
  }
}

export default function VSCodeWorkbench() {
  const [files, setFiles] = useState<EditorFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('f-java-1');
  const [openTabs, setOpenTabs] = useState<string[]>(['f-java-1', 'f-py-1']);
  const [output, setOutput] = useState<string>('');
  const [stdinInput, setStdinInput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execMeta, setExecMeta] = useState<{ time?: string; code?: number } | null>(null);

  // New file creation state
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [activeTabPanel, setActiveTabPanel] = useState<'output' | 'stdin'>('output');

  // Load persistent files from localStorage on start
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studentos_vscode_files');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFiles(parsed);
          setActiveFileId(parsed[0].id);
          setOpenTabs([parsed[0].id]);
        }
      }
    } catch {}
  }, []);

  // Save files to localStorage
  const saveFilesState = (newFiles: EditorFile[]) => {
    setFiles(newFiles);
    try {
      localStorage.setItem('studentos_vscode_files', JSON.stringify(newFiles));
    } catch {}
  };

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCodeChange = (newCode?: string) => {
    if (!activeFile) return;
    const updated = files.map((f) =>
      f.id === activeFile.id ? { ...f, content: newCode || '' } : f
    );
    saveFilesState(updated);
  };

  const handleOpenFile = (fileId: string) => {
    if (!openTabs.includes(fileId)) {
      setOpenTabs((prev) => [...prev, fileId]);
    }
    setActiveFileId(fileId);
  };

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter((id) => id !== fileId);
    setOpenTabs(remaining);
    if (activeFileId === fileId && remaining.length > 0) {
      setActiveFileId(remaining[remaining.length - 1]);
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const lang = getLanguageFromFileName(name);
    const newFile: EditorFile = {
      id: `f-${Date.now()}`,
      name,
      type: 'file',
      language: lang,
      content: `// ${name}\n// Created in StudentOS IDE\n`,
    };

    const updated = [...files, newFile];
    saveFilesState(updated);
    setOpenTabs((prev) => [...prev, newFile.id]);
    setActiveFileId(newFile.id);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert('Cannot delete the last remaining file.');
      return;
    }
    if (!confirm('Are you sure you want to delete this file?')) return;
    const updated = files.filter((f) => f.id !== fileId);
    saveFilesState(updated);
    setOpenTabs((prev) => prev.filter((id) => id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(updated[0].id);
    }
  };

  const handleRunCode = async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setActiveTabPanel('output');
    setOutput('Compiling and executing in sandbox container...\n');
    setExecMeta(null);

    const start = Date.now();
    try {
      const res = await api.post('/coding/execute', {
        language: activeFile.language,
        fileName: activeFile.name,
        content: activeFile.content,
        stdin: stdinInput,
      });

      const data = res.data;
      const stdout = data.run?.stdout || data.run?.output || '';
      const stderr = data.run?.stderr || data.compile?.stderr || '';
      const execTime = data.run?.execTime || `${Date.now() - start}ms`;
      const code = data.run?.code ?? 0;

      let resultText = '';
      if (stdout) resultText += stdout;
      if (stderr) resultText += (resultText ? '\n--- ERRORS ---\n' : '') + stderr;
      if (!resultText) resultText = 'Program finished cleanly with no output.';

      setOutput(resultText);
      setExecMeta({ time: execTime, code });
    } catch (err: any) {
      const elapsed = `${Date.now() - start}ms`;
      setOutput(`Execution failed or network error:\n${err?.response?.data?.message || err.message}`);
      setExecMeta({ time: elapsed, code: 1 });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-90px)] flex flex-col space-y-2">
      {/* Top VS Code Command Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/90 border border-zinc-800 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Code2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">StudentOS Studio</span>
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                VS Code Engine
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400">
              Editing: <strong className="text-zinc-200">{activeFile?.name}</strong> ({activeFile?.language})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`text-xs capitalize font-medium ${getFileBadgeColor(activeFile?.language || 'js')}`}>
            {activeFile?.language || 'JavaScript'}
          </Badge>

          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            variant="apple"
            size="sm"
            className="h-8 gap-1.5 px-4 font-semibold shadow-md shadow-blue-500/20"
          >
            {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} className="fill-white" />}
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Main IDE Grid */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* ── Left File Explorer ── */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/80 bg-zinc-900/50">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Folder size={14} className="text-blue-400" /> Explorer
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreatingFile(true)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="New File"
              >
                <FilePlus size={14} />
              </button>
              <button
                onClick={() => saveFilesState(DEFAULT_FILES)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Reset Default Templates"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {/* New file input form */}
          {isCreatingFile && (
            <div className="p-2 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. Solution.java"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile();
                  if (e.key === 'Escape') setIsCreatingFile(false);
                }}
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button onClick={handleCreateFile} className="p-1 text-emerald-400 hover:bg-zinc-800 rounded">
                <Check size={14} />
              </button>
              <button onClick={() => setIsCreatingFile(false)} className="p-1 text-zinc-400 hover:bg-zinc-800 rounded">
                <X size={14} />
              </button>
            </div>
          )}

          {/* File list tree */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 py-1 tracking-widest">
              src / workspace
            </div>
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              return (
                <div
                  key={file.id}
                  onClick={() => handleOpenFile(file.id)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode size={14} className={isActive ? 'text-blue-400' : 'text-zinc-500'} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteFile(file.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-opacity"
                    title="Delete File"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between bg-zinc-950">
            <span>{files.length} Files</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
              ● Compilers Live
            </span>
          </div>
        </div>

        {/* ── Center Monaco Editor Area ── */}
        <div className="col-span-12 md:col-span-5 lg:col-span-6 bg-[#1e1e1e] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          {/* Editor Tabs Bar */}
          <div className="flex items-center overflow-x-auto bg-[#181818] border-b border-zinc-800/80 px-2 pt-1 gap-1">
            {openTabs.map((tabId) => {
              const file = files.find((f) => f.id === tabId);
              if (!file) return null;
              const isActive = file.id === activeFileId;
              return (
                <div
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-mono cursor-pointer transition-all border-t-2 ${
                    isActive
                      ? 'bg-[#1e1e1e] text-white border-blue-500 font-semibold'
                      : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-zinc-300'
                  }`}
                >
                  <FileCode size={13} className={isActive ? 'text-blue-400' : 'text-zinc-500'} />
                  <span>{file.name}</span>
                  <button
                    onClick={(e) => handleCloseTab(file.id, e)}
                    className="hover:text-red-400 rounded-full p-0.5"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Monaco Code Editor */}
          <div className="flex-1 min-h-[350px]">
            {activeFile && (
              <MonacoEditor
                height="100%"
                language={activeFile.language}
                theme="vs-dark"
                value={activeFile.content}
                onChange={handleCodeChange}
                options={{
                  fontSize: 13.5,
                  fontFamily: "'Fira Code', 'Cascadia Code', Menlo, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  renderLineHighlight: 'all',
                }}
              />
            )}
          </div>
        </div>

        {/* ── Right Output Console & Stdin Panel ── */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden font-mono">
          {/* Panel Tab Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTabPanel('output')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTabPanel === 'output'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Terminal size={13} className="text-emerald-400" /> Terminal Output
              </button>
              <button
                onClick={() => setActiveTabPanel('stdin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTabPanel === 'stdin'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText size={13} className="text-amber-400" /> Stdin Input
              </button>
            </div>

            {execMeta && (
              <div className="flex items-center gap-2 text-[10px]">
                <Badge variant={execMeta.code === 0 ? 'success' : 'destructive'} className="py-0">
                  {execMeta.code === 0 ? 'Exit 0' : `Exit ${execMeta.code}`}
                </Badge>
                <span className="text-zinc-400">{execMeta.time}</span>
              </div>
            )}
          </div>

          {/* Terminal / Stdin Body */}
          <div className="flex-1 p-3 overflow-y-auto bg-[#0a0a0c] text-xs">
            {activeTabPanel === 'output' ? (
              <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono select-text">
                {output || 'Click "Run Code" to compile and execute program.'}
              </pre>
            ) : (
              <div className="h-full flex flex-col space-y-2">
                <p className="text-[11px] text-zinc-400">
                  Enter interactive standard input (stdin) passed to your program during execution:
                </p>
                <textarea
                  value={stdinInput}
                  onChange={(e) => setStdinInput(e.target.value)}
                  placeholder="e.g. 5&#10;10 20 30 40 50"
                  className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 resize-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Console Footer */}
          <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Java, Python, C++, JS, TS, Go Supported</span>
            <Button
              onClick={() => setOutput('')}
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2 text-zinc-400 hover:text-white"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}