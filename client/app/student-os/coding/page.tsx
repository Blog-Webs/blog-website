'use client';

import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import {
  Play, Folder, FolderOpen, FileCode, Plus, Trash2, Edit2, RefreshCw,
  Terminal, ChevronRight, ChevronDown, Save, Code2,
  FilePlus, FolderPlus, X, Check, Layout
} from 'lucide-react';
import api from '@/lib/api';

export type EditorItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId?: string | null;
  language?: string;
  content?: string;
};

const DEFAULT_ITEMS: EditorItem[] = [
  {
    id: 'folder-src',
    name: 'src',
    type: 'folder',
    parentId: null,
  },
  {
    id: 'folder-algorithms',
    name: 'algorithms',
    type: 'folder',
    parentId: 'folder-src',
  },
  {
    id: 'f-java-1',
    name: 'Main.java',
    type: 'file',
    parentId: 'folder-src',
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
    parentId: 'folder-algorithms',
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
    parentId: null,
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
    parentId: null,
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

export default function VSCodeWorkbench() {
  const [items, setItems] = useState<EditorItem[]>(DEFAULT_ITEMS);
  const [activeFileId, setActiveFileId] = useState<string>('f-java-1');
  const [openTabs, setOpenTabs] = useState<string[]>(['f-java-1', 'f-py-1']);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'folder-src': true,
    'folder-algorithms': true,
  });

  const [output, setOutput] = useState<string>('');
  const [stdinInput, setStdinInput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execMeta, setExecMeta] = useState<{ time?: string; code?: number } | null>(null);

  const [createTargetParent, setCreateTargetParent] = useState<string | null | undefined>(undefined);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [newItemName, setNewItemName] = useState<string>('');
  const [activeTabPanel, setActiveTabPanel] = useState<'output' | 'stdin'>('output');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('studentos_vscode_files');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          const firstFile = parsed.find((i: EditorItem) => i.type === 'file');
          if (firstFile) {
            setActiveFileId(firstFile.id);
            setOpenTabs([firstFile.id]);
          }
        }
      }
    } catch {}
  }, []);

  const saveItemsState = (newItems: EditorItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('studentos_vscode_files', JSON.stringify(newItems));
    } catch {}
  };

  const activeFile = items.find((f) => f.id === activeFileId && f.type === 'file') || items.find(f => f.type === 'file');

  const handleCodeChange = (newCode?: string) => {
    if (!activeFile) return;
    const updated = items.map((f) =>
      f.id === activeFile.id ? { ...f, content: newCode || '' } : f
    );
    saveItemsState(updated);
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

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleStartCreate = (parentId: string | null, type: 'file' | 'folder', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCreateTargetParent(parentId);
    setCreateType(type);
    setNewItemName('');
    if (parentId && !expandedFolders[parentId]) {
      setExpandedFolders(prev => ({ ...prev, [parentId]: true }));
    }
  };

  const handleConfirmCreate = () => {
    if (!newItemName.trim()) return setCreateTargetParent(undefined);
    const name = newItemName.trim();

    if (createType === 'folder') {
      const newFolder: EditorItem = {
        id: `folder-${Date.now()}`,
        name,
        type: 'folder',
        parentId: createTargetParent,
      };
      const updated = [...items, newFolder];
      saveItemsState(updated);
      setExpandedFolders(prev => ({ ...prev, [newFolder.id]: true }));
    } else {
      const lang = getLanguageFromFileName(name);
      const newFile: EditorItem = {
        id: `f-${Date.now()}`,
        name,
        type: 'file',
        parentId: createTargetParent,
        language: lang,
        content: `// ${name}\n// Created in StudentOS Studio\n\n`,
      };
      const updated = [...items, newFile];
      saveItemsState(updated);
      setOpenTabs((prev) => [...prev, newFile.id]);
      setActiveFileId(newFile.id);
    }

    setNewItemName('');
    setCreateTargetParent(undefined);
  };

  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (!confirm(`Delete ${item.type} "${item.name}"?`)) return;

    const getSubItemIds = (id: string): string[] => {
      const children = items.filter(i => i.parentId === id);
      let ids = [id];
      for (const child of children) {
        ids = [...ids, ...getSubItemIds(child.id)];
      }
      return ids;
    };

    const toDeleteIds = getSubItemIds(itemId);
    const updated = items.filter(i => !toDeleteIds.includes(i.id));

    saveItemsState(updated);
    setOpenTabs(prev => prev.filter(id => !toDeleteIds.includes(id)));

    if (toDeleteIds.includes(activeFileId)) {
      const remainingFile = updated.find(i => i.type === 'file');
      if (remainingFile) setActiveFileId(remainingFile.id);
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

  const renderTree = (parentId: string | null = null, depth: number = 0) => {
    const children = items.filter(i => i.parentId === parentId);
    if (children.length === 0 && createTargetParent !== parentId) return null;

    return (
      <div className="space-y-0.5">
        {children.map(item => {
          if (item.type === 'folder') {
            const isExpanded = !!expandedFolders[item.id];
            return (
              <div key={item.id} className="select-none">
                <div
                  onClick={() => toggleFolder(item.id)}
                  style={{ paddingLeft: `${depth * 10 + 6}px` }}
                  className="group flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors text-xs font-medium"
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    {isExpanded ? <ChevronDown size={13} className="text-gray-400 shrink-0" /> : <ChevronRight size={13} className="text-gray-400 shrink-0" />}
                    {isExpanded ? <FolderOpen size={14} className="text-blue-600 shrink-0" /> : <Folder size={14} className="text-blue-600 shrink-0" />}
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => handleStartCreate(item.id, 'file', e)}
                      className="p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                      title="New file in folder"
                    >
                      <FilePlus size={12} />
                    </button>
                    <button
                      onClick={e => handleStartCreate(item.id, 'folder', e)}
                      className="p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                      title="New sub-folder"
                    >
                      <FolderPlus size={12} />
                    </button>
                    <button
                      onClick={e => handleDeleteItem(item.id, e)}
                      className="p-0.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                      title="Delete folder"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {createTargetParent === item.id && (
                  <div style={{ paddingLeft: `${(depth + 1) * 10 + 6}px` }} className="p-1 flex items-center gap-1 bg-white rounded border border-blue-500 my-0.5 shadow-xs">
                    {createType === 'folder' ? <Folder size={13} className="text-blue-600" /> : <FileCode size={13} className="text-blue-600" />}
                    <input
                      type="text"
                      autoFocus
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleConfirmCreate();
                        if (e.key === 'Escape') setCreateTargetParent(undefined);
                      }}
                      placeholder={createType === 'folder' ? 'folder-name' : 'filename.ext'}
                      className="w-full bg-transparent text-xs text-gray-900 focus:outline-none"
                    />
                    <button onClick={handleConfirmCreate} className="text-blue-600 hover:text-blue-800"><Check size={12} /></button>
                    <button onClick={() => setCreateTargetParent(undefined)} className="text-gray-400 hover:text-gray-700"><X size={12} /></button>
                  </div>
                )}

                {isExpanded && renderTree(item.id, depth + 1)}
              </div>
            );
          } else {
            const isActive = activeFileId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleOpenFile(item.id)}
                style={{ paddingLeft: `${depth * 10 + 6}px` }}
                className={`group flex items-center justify-between py-1 px-1.5 rounded-md cursor-pointer transition-all text-xs select-none ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <FileCode size={13} className={isActive ? 'text-blue-600 shrink-0' : 'text-gray-400 shrink-0'} />
                  <span className="truncate">{item.name}</span>
                </div>

                <button
                  onClick={e => handleDeleteItem(item.id, e)}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-opacity"
                  title="Delete file"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          }
        })}

        {createTargetParent === parentId && (
          <div style={{ paddingLeft: `${depth * 10 + 6}px` }} className="p-1 flex items-center gap-1 bg-white rounded border border-blue-500 my-0.5 shadow-xs">
            {createType === 'folder' ? <Folder size={13} className="text-blue-600" /> : <FileCode size={13} className="text-blue-600" />}
            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirmCreate();
                if (e.key === 'Escape') setCreateTargetParent(undefined);
              }}
              placeholder={createType === 'folder' ? 'folder-name' : 'filename.ext'}
              className="w-full bg-transparent text-xs text-gray-900 focus:outline-none"
            />
            <button onClick={handleConfirmCreate} className="text-blue-600 hover:text-blue-800"><Check size={12} /></button>
            <button onClick={() => setCreateTargetParent(undefined)} className="text-gray-400 hover:text-gray-700"><X size={12} /></button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col space-y-2">
      {/* Top Command Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Code2 size={16} className="text-gray-700" />
          <span className="text-xs font-semibold text-gray-900">Compute & Code Studio</span>
          <span className="text-[10px] text-gray-400">|</span>
          <span className="text-xs text-gray-500">
            {activeFile?.name} ({activeFile?.language})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="h-7 gap-1 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs flex items-center transition-colors"
          >
            {isRunning ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} className="fill-white" />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Main IDE Grid */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* Explorer */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 bg-white border border-gray-200 rounded-md flex flex-col overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-200 bg-gray-50/70">
            <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
              <Layout size={13} className="text-gray-500" /> Explorer
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={e => handleStartCreate(null, 'file', e)}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                title="New File at Root"
              >
                <FilePlus size={13} />
              </button>
              <button
                onClick={e => handleStartCreate(null, 'folder', e)}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                title="New Folder at Root"
              >
                <FolderPlus size={13} />
              </button>
              <button
                onClick={() => saveItemsState(DEFAULT_ITEMS)}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                title="Reset Workspace"
              >
                <RefreshCw size={11} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5">
            {renderTree(null, 0)}
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="col-span-12 md:col-span-9 lg:col-span-7 bg-white border border-gray-200 rounded-md flex flex-col overflow-hidden shadow-2xs">
          <div className="flex items-center gap-1 px-1.5 pt-1.5 bg-gray-50/70 border-b border-gray-200 overflow-x-auto">
            {openTabs.map((tabId) => {
              const file = items.find((f) => f.id === tabId);
              if (!file) return null;
              const isActive = activeFileId === tabId;
              return (
                <div
                  key={tabId}
                  onClick={() => setActiveFileId(tabId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-t-md text-xs cursor-pointer border-t border-x transition-all ${
                    isActive
                      ? 'bg-white border-gray-200 text-gray-900 font-semibold border-b-transparent shadow-2xs'
                      : 'bg-transparent border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <FileCode size={12} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                  <span>{file.name}</span>
                  <button
                    onClick={(e) => handleCloseTab(tabId, e)}
                    className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex-1 relative bg-white">
            {activeFile ? (
              <MonacoEditor
                height="100%"
                language={activeFile.language}
                theme="light"
                value={activeFile.content}
                onChange={handleCodeChange}
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 8, bottom: 8 },
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                <FileCode size={32} className="mb-2 opacity-40" />
                <p>No open files.</p>
              </div>
            )}
          </div>
        </div>

        {/* Terminal & Stdin */}
        <div className="col-span-12 lg:col-span-3 bg-white border border-gray-200 rounded-md flex flex-col overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-200 bg-gray-50/70">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTabPanel('output')}
                className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                  activeTabPanel === 'output' ? 'bg-gray-200 text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Output
              </button>
              <button
                onClick={() => setActiveTabPanel('stdin')}
                className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                  activeTabPanel === 'stdin' ? 'bg-gray-200 text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Stdin
              </button>
            </div>

            {execMeta && (
              <span className="text-[10px] text-gray-500 font-mono">
                {execMeta.time}
              </span>
            )}
          </div>

          <div className="flex-1 p-2.5 font-mono text-xs overflow-y-auto bg-gray-900 text-gray-100">
            {activeTabPanel === 'output' ? (
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed font-mono text-xs">
                {output || 'Click "Run Code" to compile & execute.'}
              </pre>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-sans font-medium">Console Input</label>
                <textarea
                  value={stdinInput}
                  onChange={e => setStdinInput(e.target.value)}
                  placeholder="Test inputs for program execution..."
                  className="w-full h-36 p-2 rounded border border-gray-700 bg-gray-950 text-xs text-white focus:outline-none font-mono"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}