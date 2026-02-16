import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, FolderOpen, File, Plus, Trash2, Download, Code2, Terminal as TerminalIcon, FileCode, ChevronRight, ChevronDown, X, Bug, CheckCircle, AlertCircle } from 'lucide-react';

interface Script {
  name: string;
  language: string;
  content: string;
  path: string;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

const CodeEditor: React.FC = () => {
  const [openFiles, setOpenFiles] = useState<Script[]>([{ name: 'script.py', language: 'python', content: '# Write your Python code here\nprint("Hello from AI Sherly Code Editor!")\n', path: '/script.py' }]);
  const [activeFile, setActiveFile] = useState(0);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const editorRef = useRef<any>(null);

  // File tree structure (mock data)
  const fileTree: FileNode[] = [
    {
      name: 'scripts',
      type: 'folder',
      path: '/scripts',
      children: [
        { name: 'main.py', type: 'file', path: '/scripts/main.py' },
        { name: 'utils.js', type: 'file', path: '/scripts/utils.js' },
        { name: 'test.sh', type: 'file', path: '/scripts/test.sh' },
      ]
    },
    { name: 'script.py', type: 'file', path: '/script.py' },
    { name: 'app.js', type: 'file', path: '/app.js' },
    { name: 'config.json', type: 'file', path: '/config.json' },
  ];

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'py': 'python', 'js': 'javascript', 'ts': 'typescript',
      'c': 'c', 'cpp': 'cpp', 'java': 'java', 'go': 'go',
      'rs': 'rust', 'rb': 'ruby', 'php': 'php', 'sh': 'bash',
      'json': 'json', 'html': 'html', 'css': 'css', 'md': 'markdown'
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleSave = async () => {
    if (openFiles.length === 0) return;
    const currentFile = openFiles[activeFile];
    try {
      const backendUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${backendUrl}/api/scripts/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: currentFile.name, content: currentFile.content })
      });
      const data = await res.json();
      if (data.success) {
        setOutput(`✓ Saved ${currentFile.name}\n`);
      }
    } catch (error) {
      setOutput(`✗ Save failed: ${error}\n`);
    }
  };

  const handleExecute = async () => {
    if (openFiles.length === 0) return;
    const currentFile = openFiles[activeFile];

    setIsExecuting(true);
    setOutput('🚀 Executing...\n');

    try {
      const backendUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${backendUrl}/api/execute/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentFile.content,
          language: currentFile.language,
          filename: currentFile.name
        })
      });
      const data = await res.json();

      if (data.success) {
        setOutput(`✓ Execution completed\n\n${data.output}${data.error ? `\nWarnings:\n${data.error}` : ''}`);
      } else {
        setOutput(`✗ Execution failed\n\n${data.errorOutput || data.error}`);
      }
    } catch (error) {
      setOutput(`✗ Request failed: ${error}\n`);
    } finally {
      setIsExecuting(false);
    }
  };

  const openFile = (node: FileNode) => {
    if (node.type === 'folder') {
      toggleFolder(node.path);
      return;
    }

    // Check if already open
    const existingIndex = openFiles.findIndex(f => f.path === node.path);
    if (existingIndex >= 0) {
      setActiveFile(existingIndex);
      return;
    }

    // Open new file
    const language = getLanguageFromFilename(node.name);
    const defaultContent = language === 'python'
      ? `# ${node.name}\nprint("Hello from ${node.name}")\n`
      : language === 'javascript'
        ? `// ${node.name}\nconsole.log("Hello from ${node.name}");\n`
        : `// ${node.name}\n`;

    const newFile: Script = {
      name: node.name,
      language,
      content: defaultContent,
      path: node.path
    };

    setOpenFiles([...openFiles, newFile]);
    setActiveFile(openFiles.length);
  };

  const closeFile = (index: number) => {
    if (openFiles.length === 1) return; // Keep at least one file open
    const newFiles = openFiles.filter((_, i) => i !== index);
    setOpenFiles(newFiles);
    if (activeFile >= newFiles.length) {
      setActiveFile(newFiles.length - 1);
    } else if (activeFile > index) {
      setActiveFile(activeFile - 1);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 hover:bg-gray-800 cursor-pointer text-xs transition-colors ${openFiles[activeFile]?.path === node.path ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'
            }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => openFile(node)}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown size={14} className="text-gray-500" />
              ) : (
                <ChevronRight size={14} className="text-gray-500" />
              )}
              <FolderOpen size={14} className="text-yellow-500" />
            </>
          ) : (
            <>
              <div className="w-3.5" />
              <FileCode size={14} className="text-green-500" />
            </>
          )}
          <span className="font-mono">{node.name}</span>
        </div>
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const updateFileContent = (content: string) => {
    const newFiles = [...openFiles];
    newFiles[activeFile].content = content;
    setOpenFiles(newFiles);
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Code2 size={20} className="text-blue-500" />
          <h2 className="font-orbitron font-bold text-sm">CODE EDITOR</h2>
          <span className="text-xs text-gray-600 font-mono">Professional IDE</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            {showSidebar ? '◀' : '▶'} Files
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
            <div className="p-2 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Explorer</span>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-800 rounded" title="New File">
                  <Plus size={14} className="text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-800 rounded" title="Refresh">
                  <Download size={14} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderFileTree(fileTree)}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-gray-900 border-b border-gray-800 flex items-center overflow-x-auto">
            {openFiles.map((file, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-2 border-r border-gray-800 cursor-pointer group min-w-0 ${activeFile === index
                    ? 'bg-gray-950 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-850'
                  }`}
                onClick={() => setActiveFile(index)}
              >
                <FileCode size={14} className="text-green-500 flex-shrink-0" />
                <span className="text-xs font-mono truncate">{file.name}</span>
                {openFiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-red-900/30 rounded p-0.5 transition-opacity flex-shrink-0"
                  >
                    <X size={12} className="text-gray-500 hover:text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            {openFiles.length > 0 ? (
              <Editor
                height="100%"
                language={openFiles[activeFile].language}
                value={openFiles[activeFile].content}
                onChange={(value) => updateFileContent(value || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  lineNumbers: 'on',
                  rulers: [80, 120],
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  tabSize: 4,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                <div className="text-center">
                  <Code2 size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No file open. Select a file from the explorer.</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="h-12 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">
                {openFiles.length > 0 && `Language: ${openFiles[activeFile].language}`}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                <Save size={14} /> Save
              </button>
              <button
                onClick={handleExecute}
                disabled={isExecuting || openFiles.length === 0}
                className="flex items-center gap-2 px-4 py-1.5 rounded bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-black text-xs font-bold transition-colors"
              >
                <Play size={14} /> {isExecuting ? 'Running...' : 'Execute'}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          {output && (
            <div className="h-48 bg-black border-t border-gray-800 flex flex-col">
              <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <TerminalIcon size={14} className="text-green-500" />
                  <span className="text-xs font-bold text-gray-400">OUTPUT</span>
                </div>
                <button
                  onClick={() => setOutput('')}
                  className="text-gray-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
                <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
