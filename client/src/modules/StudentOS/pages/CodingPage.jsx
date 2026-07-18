import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, FolderOpen, FileCode, Plus, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

// Ensure you replace with your actual API endpoint or use a relative path if proxied
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
axios.defaults.withCredentials = true;

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

  // Fetch projects on load
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/coding/projects`);
      setProjects(data);
      if (data.length > 0) {
        selectProject(data[0]);
      } else {
        // Create default project
        const res = await axios.post(`${API_URL}/coding/projects`, { name: 'My Workspace' });
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
      const { data } = await axios.get(`${API_URL}/coding/projects/${project._id}/files`);
      setFiles(data);
      if (data.length > 0) {
        selectFile(data[0]);
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

  const createNewFile = async () => {
    if (!activeProject) return;
    const name = prompt('Enter file name (e.g., Main.java, script.py):');
    if (!name) return;
    
    let language = 'java';
    if (name.endsWith('.py')) language = 'python';
    if (name.endsWith('.js')) language = 'javascript';
    if (name.endsWith('.cpp')) language = 'cpp';

    const defaultContent = language === 'java' 
      ? 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}'
      : language === 'python'
      ? 'print("Hello World")'
      : '// Start coding';

    try {
      const { data } = await axios.post(`${API_URL}/coding/files`, {
        projectId: activeProject._id,
        name,
        language,
        content: defaultContent
      });
      setFiles([...files, data]);
      selectFile(data);
    } catch (err) {
      console.error('Failed to create file', err);
    }
  };

  // Debounced Auto Save
  const handleEditorChange = (value) => {
    setEditorContent(value);
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveFile(value);
    }, 2500); // Save after 2.5s of inactivity
  };

  const saveFile = async (contentToSave) => {
    if (!activeFile) return;
    setIsSaving(true);
    try {
      await axios.put(`${API_URL}/coding/files/${activeFile._id}`, {
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
      const { data } = await axios.post(`${API_URL}/coding/execute`, {
        language: activeFile.language,
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

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-sans">
      {/* Top Header */}
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
        {/* Sidebar */}
        <div className="w-64 border-r border-[#333] bg-[#252526] flex flex-col">
          <div className="p-3 border-b border-[#333] flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">Explorer</span>
            <button onClick={createNewFile} className="p-1 hover:bg-[#3a3d41] rounded" title="New File">
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {files.map(f => (
              <div 
                key={f._id}
                onClick={() => selectFile(f)}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm cursor-pointer hover:bg-[#2a2d2e] ${activeFile?._id === f._id ? 'bg-[#37373d] text-white' : ''}`}
              >
                <FileCode size={14} className={f.language === 'python' ? 'text-yellow-400' : 'text-blue-400'} />
                {f.name}
              </div>
            ))}
            {files.length === 0 && (
              <div className="px-4 py-4 text-sm text-gray-500">No files found.</div>
            )}
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor */}
          <div className="flex-1 relative">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language}
                theme="vs-dark"
                value={editorContent}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select or create a file to start coding
              </div>
            )}
          </div>

          {/* Console */}
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
