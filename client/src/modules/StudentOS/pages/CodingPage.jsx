import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, FolderOpen, FileCode, Plus, Loader2, RefreshCw, Folder, ChevronRight, ChevronDown, FolderPlus, Edit2, Trash2 } from 'lucide-react';
import api from '../../core/api/client';

const FileTreeNode = ({ node, activeFile, selectFile, createItemInside, renameItem, deleteItem, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';

  if (isFolder) {
    return (
      <div className="w-full">
        <div 
          className="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer hover:bg-[#2a2d2e] group"
          style={{ paddingLeft: `${depth * 12 + 16}px`, paddingRight: '16px' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            <Folder size={14} className="text-blue-400 shrink-0" />
            <span className="truncate">{node.name}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); createItemInside(node, 'file'); }} className="p-0.5 hover:bg-[#3a3d41] rounded" title="New File"><Plus size={12}/></button>
            <button onClick={(e) => { e.stopPropagation(); createItemInside(node, 'folder'); }} className="p-0.5 hover:bg-[#3a3d41] rounded" title="New Folder"><FolderPlus size={12}/></button>
            <button onClick={(e) => { e.stopPropagation(); renameItem(node); }} className="p-0.5 hover:bg-[#3a3d41] rounded" title="Rename"><Edit2 size={12}/></button>
            <button onClick={(e) => { e.stopPropagation(); deleteItem(node); }} className="p-0.5 hover:bg-red-900/30 text-red-400 rounded" title="Delete"><Trash2 size={12}/></button>
          </div>
        </div>
        {isOpen && node.children?.map(child => (
          <FileTreeNode 
            key={child._id} 
            node={child} 
            activeFile={activeFile} 
            selectFile={selectFile} 
            createItemInside={createItemInside}
            renameItem={renameItem}
            deleteItem={deleteItem}
            depth={depth + 1} 
          />
        ))}
      </div>
    );
  }

  // File
  return (
    <div 
      onClick={() => selectFile(node)}
      className={`flex items-center justify-between py-1.5 text-sm cursor-pointer hover:bg-[#2a2d2e] group ${activeFile?._id === node._id ? 'bg-[#37373d] text-white' : ''}`}
      style={{ paddingLeft: `${depth * 12 + 24}px`, paddingRight: '16px' }}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <FileCode size={14} className={node.language === 'python' ? 'text-yellow-400' : 'text-blue-400 shrink-0'} />
        <span className="truncate">{node.name}</span>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); renameItem(node); }} className="p-0.5 hover:bg-[#3a3d41] rounded" title="Rename"><Edit2 size={12}/></button>
        <button onClick={(e) => { e.stopPropagation(); deleteItem(node); }} className="p-0.5 hover:bg-red-900/30 text-red-400 rounded" title="Delete"><Trash2 size={12}/></button>
      </div>
    </div>
  );
};

const CodingPage = () => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  
  const [editorContent, setEditorContent] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/coding/projects');
      setProjects(data);
      if (data.length > 0) {
        selectProject(data[0]);
      } else {
        const res = await api.post('/coding/projects', { name: 'My Workspace' });
        setProjects([res.data]);
        selectProject(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const selectProject = async (project) => {
    setActiveProject(project);
    try {
      const { data } = await api.get(`/coding/projects/${project._id}/files`);
      setFiles(data);
      if (data.length > 0) {
        const firstFile = data.find(f => f.type !== 'folder');
        if (firstFile) selectFile(firstFile);
      } else {
        setActiveFile(null);
        setEditorContent('// Create a new file to start coding\n');
      }
    } catch (err) {
      console.error('Failed to fetch files', err);
    }
  };

  const selectFile = (file) => {
    setActiveFile(file);
    setEditorContent(file.content);
    setOutput('');
  };

  const createItem = async (parentFolder, type) => {
    if (!activeProject) return;
    const name = prompt(`Enter ${type} name:` + (type === 'file' ? ' (e.g., Main.java)' : ''));
    if (!name) return;
    
    let language = 'none';
    let defaultContent = '';

    if (type === 'file') {
      language = 'java';
      if (name.endsWith('.py')) language = 'python';
      if (name.endsWith('.js')) language = 'javascript';
      if (name.endsWith('.cpp')) language = 'cpp';

      defaultContent = language === 'java' 
        ? 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}'
        : language === 'python'
        ? 'print("Hello World")'
        : '// Start coding';
    }

    let folderPath = '/';
    if (parentFolder) {
      folderPath = parentFolder.folderPath === '/' 
        ? `/${parentFolder.name}` 
        : `${parentFolder.folderPath}/${parentFolder.name}`;
    }

    try {
      const { data } = await api.post('/coding/files', {
        projectId: activeProject._id,
        name,
        type,
        language,
        content: defaultContent,
        folderPath
      });
      setFiles([...files, data]);
      if (type === 'file') {
        selectFile(data);
      }
    } catch (err) {
      console.error(`Failed to create ${type}`, err);
    }
  };

  const renameItem = async (node) => {
    const newName = prompt(`Enter new name for ${node.name}:`, node.name);
    if (!newName || newName === node.name) return;

    try {
      const { data } = await api.put(`/coding/files/${node._id}`, { name: newName });
      setFiles(files.map(f => f._id === node._id ? { ...f, name: newName } : f));
      if (activeFile?._id === node._id) {
        setActiveFile({ ...activeFile, name: newName });
      }
    } catch (err) {
      console.error('Failed to rename', err);
    }
  };

  const deleteItem = async (node) => {
    if (!window.confirm(`Are you sure you want to delete ${node.name}?`)) return;

    try {
      await api.delete(`/coding/files/${node._id}`);
      
      // If it's a folder, we might need to fetch files again to remove deleted children
      if (node.type === 'folder') {
        fetchProjects(); // or just refetch files for the project
      } else {
        setFiles(files.filter(f => f._id !== node._id));
      }
      
      if (activeFile?._id === node._id) {
        setActiveFile(null);
        setEditorContent('// Create or select a file to start coding\n');
      }
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleEditorChange = (value) => {
    setEditorContent(value);
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveFile(value);
    }, 2500);
  };

  const saveFile = async (contentToSave) => {
    if (!activeFile) return;
    setIsSaving(true);
    try {
      await api.put(`/coding/files/${activeFile._id}`, {
        content: contentToSave
      });
    } catch (err) {
      console.error('Failed to auto-save', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setOutput('Running...');
    try {
      // We pass activeFile.name as fileName so piston runs exactly this file, e.g. "tanish.java"
      const { data } = await api.post('/coding/execute', {
        language: activeFile.language,
        fileName: activeFile.name,
        content: editorContent,
        stdin: ''
      });
      
      let resOutput = '';
      if (data.compile && data.compile.stderr) {
        resOutput += 'Compilation Error:\n' + data.compile.stderr + '\n';
      }
      if (data.run) {
        if (data.run.stderr) {
          resOutput += 'Runtime Error:\n' + data.run.stderr + '\n';
        }
        resOutput += data.run.output;
      }
      setOutput(resOutput || 'Done (no output).');
    } catch (err) {
      console.error(err);
      setOutput('Failed to execute code. Check server logs.');
    } finally {
      setIsRunning(false);
    }
  };

  // Build Tree
  const buildTree = () => {
    const root = { children: [] };
    const map = { '/': root };

    files.filter(f => f.type === 'folder').forEach(folder => {
      const path = folder.folderPath === '/' ? `/${folder.name}` : `${folder.folderPath}/${folder.name}`;
      map[path] = { ...folder, children: [] };
    });

    files.forEach(f => {
      let parentPath = f.folderPath || '/';
      if (!map[parentPath]) parentPath = '/';
      
      if (f.type === 'folder') {
        const path = f.folderPath === '/' ? `/${f.name}` : `${f.folderPath}/${f.name}`;
        map[parentPath].children.push(map[path]);
      } else {
        map[parentPath].children.push(f);
      }
    });

    return root.children;
  };

  const tree = buildTree();

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-sans">
      <div className="h-14 border-b border-[#333] flex items-center justify-between px-4 bg-[#252526]">
        <div className="flex items-center gap-2 font-semibold">
          <FolderOpen size={18} className="text-blue-400" />
          <span>{activeProject ? activeProject.name : 'Loading Workspace...'}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400 flex items-center gap-1 min-w-[80px]">
            {isSaving ? <><RefreshCw size={12} className="animate-spin" /> Saving...</> : 'Saved'}
          </div>
          <button 
            onClick={handleRun}
            disabled={isRunning || !activeFile}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Run Code
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-[#333] bg-[#252526] flex flex-col">
          <div className="p-3 border-b border-[#333] flex items-center justify-between group">
            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">Explorer</span>
            <div className="flex items-center gap-1">
              <button onClick={() => createItem(null, 'file')} className="p-1 hover:bg-[#3a3d41] rounded text-gray-400 hover:text-white" title="New File">
                <Plus size={14} />
              </button>
              <button onClick={() => createItem(null, 'folder')} className="p-1 hover:bg-[#3a3d41] rounded text-gray-400 hover:text-white" title="New Folder">
                <FolderPlus size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {tree.map(node => (
              <FileTreeNode 
                key={node._id} 
                node={node} 
                activeFile={activeFile} 
                selectFile={selectFile}
                createItemInside={createItem}
                renameItem={renameItem}
                deleteItem={deleteItem}
              />
            ))}
            {tree.length === 0 && (
              <div className="px-4 py-4 text-sm text-gray-500">No files found.</div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language}
                theme="vs-dark"
                value={editorContent}
                onChange={handleEditorChange}
                options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', automaticLayout: true }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select or create a file to start coding
              </div>
            )}
          </div>

          <div className="h-48 border-t border-[#333] bg-[#1e1e1e] flex flex-col">
            <div className="h-8 border-b border-[#333] flex items-center px-4">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Terminal Output</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-sm whitespace-pre-wrap text-gray-300">
              {output || 'Output will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
