import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, FolderPlus, FilePlus, File, Trash2, Edit2, Code2, Terminal as TerminalIcon, FileCode, ChevronRight, ChevronDown, X, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react';

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
  const [openFiles, setOpenFiles] = useState<Script[]>([
    { name: 'main.py', language: 'python', content: '# Python Example\nprint("Hello from AI Sherly!")\n\n# Your code here\n', path: '/main.py' }
  ]);
  const [activeFile, setActiveFile] = useState(0);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [fileTree, setFileTree] = useState<FileNode[]>([
    { name: 'main.py', type: 'file', path: '/main.py' },
    { name: 'app.js', type: 'file', path: '/app.js' },
    { name: 'styles.css', type: 'file', path: '/styles.css' },
  ]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('AI Sherly Terminal v1.0\nType commands here...\n');
  const [terminalInput, setTerminalInput] = useState('');
  const editorRef = useRef<any>(null);

  const languageTemplates: Record<string, string> = {
    python: '# Python Script\nprint("Hello World")\n',
    javascript: '// JavaScript\nconsole.log("Hello World");\n',
    typescript: '// TypeScript\nconst message: string = "Hello World";\nconsole.log(message);\n',
    c: '// C Program\n#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}\n',
    cpp: '// C++ Program\n#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}\n',
    java: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}\n',
    go: '// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}\n',
    rust: '// Rust\nfn main() {\n    println!("Hello World");\n}\n',
    ruby: '# Ruby\nputs "Hello World"\n',
    php: '<?php\necho "Hello World";\n?>\n',
    bash: '#!/bin/bash\necho "Hello World"\n',
    html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>\n',
    css: '/* CSS */\nbody {\n    font-family: Arial, sans-serif;\n    background: #000;\n    color: #0f0;\n}\n',
    json: '{\n    "message": "Hello World"\n}\n',
  };

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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setOutput(`✅ Saved ${currentFile.name}\n`);
      } else {
        setOutput(`❌ Save failed: ${data.error || 'Unknown error'}\n`);
      }
    } catch (error) {
      setOutput(`❌ Save failed: ${error instanceof Error ? error.message : 'Network error'}\n`);
    }
  };

  const handleExecute = async () => {
    if (openFiles.length === 0) return;
    const currentFile = openFiles[activeFile];

    setIsExecuting(true);
    setOutput('⚡ Executing code...\n');

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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      const data = await res.json();

      if (data.success) {
        setOutput(`✅ Execution completed\n\n${data.output || '(no output)'}${data.error ? `\n⚠️ Warnings:\n${data.error}` : ''}`);
      } else {
        setOutput(`❌ Execution failed\n\n${data.errorOutput || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setOutput(`❌ Execution error: ${error instanceof Error ? error.message : 'Network error'}\n\nTip: Make sure backend is running and VITE_API_URL is set correctly.`);
    } finally {
      setIsExecuting(false);
    }
  };

  const createNewFile = () => {
    const fileName = prompt('Enter file name (e.g., script.py, app.js):');
    if (!fileName || !fileName.trim()) return;

    const trimmedName = fileName.trim();
    const language = getLanguageFromFilename(trimmedName);
    const template = languageTemplates[language] || '// New file\n';

    const newFile: Script = {
      name: trimmedName,
      language,
      content: template,
      path: `/${trimmedName}`
    };

    const newNode: FileNode = {
      name: trimmedName,
      type: 'file',
      path: `/${trimmedName}`
    };

    setFileTree([...fileTree, newNode]);
    setOpenFiles([...openFiles, newFile]);
    setActiveFile(openFiles.length);
    setOutput(`✅ Created ${trimmedName}\n`);
  };

  const createNewFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName || !folderName.trim()) return;

    const newFolder: FileNode = {
      name: folderName.trim(),
      type: 'folder',
      path: `/${folderName.trim()}`,
      children: []
    };

    setFileTree([...fileTree, newFolder]);
    setOutput(`✅ Created folder ${folderName}\n`);
  };

  const deleteFile = (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ${node.name}?`)) return;

    setFileTree(fileTree.filter(n => n.path !== node.path));

    // Close if open
    const fileIndex = openFiles.findIndex(f => f.path === node.path);
    if (fileIndex >= 0) {
      closeFile(fileIndex);
    }

    setOutput(`✅ Deleted ${node.name}\n`);
  };

  const renameFile = (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt(`Rename ${node.name} to:`, node.name);
    if (!newName || !newName.trim() || newName === node.name) return;

    const updatedTree = fileTree.map(n =>
      n.path === node.path
        ? { ...n, name: newName, path: `/${newName}` }
        : n
    );
    setFileTree(updatedTree);

    // Update open file if exists
    const fileIndex = openFiles.findIndex(f => f.path === node.path);
    if (fileIndex >= 0) {
      const updatedFiles = [...openFiles];
      updatedFiles[fileIndex] = {
        ...updatedFiles[fileIndex],
        name: newName,
        path: `/${newName}`,
        language: getLanguageFromFilename(newName)
      };
      setOpenFiles(updatedFiles);
    }

    setOutput(`✅ Renamed to ${newName}\n`);
  };

  const openFile = (node: FileNode) => {
    if (node.type === 'folder') {
      toggleFolder(node.path);
      return;
    }

    const existingIndex = openFiles.findIndex(f => f.path === node.path);
    if (existingIndex >= 0) {
      setActiveFile(existingIndex);
      return;
    }

    const language = getLanguageFromFilename(node.name);
    const template = languageTemplates[language] || `// ${node.name}\n`;

    const newFile: Script = {
      name: node.name,
      language,
      content: template,
      path: node.path
    };

    setOpenFiles([...openFiles, newFile]);
    setActiveFile(openFiles.length);
  };

  const closeFile = (index: number) => {
    if (openFiles.length === 1) {
      setOutput('⚠️ Cannot close last file\n');
      return;
    }

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
          className={`flex items-center justify-between gap-1 px-2 py-1 hover:bg-gray-800 cursor-pointer text-xs transition-colors group ${openFiles[activeFile]?.path === node.path ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'
            }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => openFile(node)}
        >
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {node.type === 'folder' ? (
              <>
                {expandedFolders.has(node.path) ? (
                  <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />
                )}
                <FolderOpen size={14} className="text-yellow-500 flex-shrink-0" />
              </>
            ) : (
              <>
                <div className="w-3.5 flex-shrink-0" />
                <FileCode size={14} className="text-green-500 flex-shrink-0" />
              </>
            )}
            <span className="font-mono truncate">{node.name}</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
            <button onClick={(e) => renameFile(node, e)} className="p-0.5 hover:bg-blue-900/50 rounded" title="Rename">
              <Edit2 size={12} className="text-blue-400" />
            </button>
            <button onClick={(e) => deleteFile(node, e)} className="p-0.5 hover:bg-red-900/50 rounded" title="Delete">
              <Trash2 size={12} className="text-red-400" />
            </button>
          </div>
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

  const executeTerminalCommand = () => {
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setTerminalOutput(prev => `${prev}\n$ ${cmd}\n`);

    // Simulate command execution
    if (cmd === 'clear') {
      setTerminalOutput('AI Sherly Terminal v1.0\n');
    } else if (cmd === 'help') {
      setTerminalOutput(prev => `${prev}Available commands:\n  clear - Clear terminal\n  ls - List files\n  pwd - Print working directory\n  help - Show this help\n`);
    } else if (cmd === 'ls') {
      const files = fileTree.map(f => f.name).join('  ');
      setTerminalOutput(prev => `${prev}${files}\n`);
    } else if (cmd === 'pwd') {
      setTerminalOutput(prev => `${prev}/workspace\n`);
    } else {
      setTerminalOutput(prev => `${prev}Command not found: ${cmd}\nType 'help' for available commands.\n`);
    }

    setTerminalInput('');
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Code2 size={20} className="text-blue-500" />
          <h2 className="font-orbitron font-bold text-sm">CODE EDITOR</h2>
          <span className="text-xs text-gray-600 font-mono">Multi-Language IDE</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`px-2 py-1 text-xs rounded transition-colors ${showTerminal ? 'bg-green-600 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <TerminalIcon size={14} className="inline mr-1" />
            Terminal
          </button>
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
                <button onClick={createNewFile} className="p-1 hover:bg-gray-800 rounded" title="New File">
                  <FilePlus size={14} className="text-green-500" />
                </button>
                <button onClick={createNewFolder} className="p-1 hover:bg-gray-800 rounded" title="New Folder">
                  <FolderPlus size={14} className="text-yellow-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderFileTree(fileTree)}
            </div>
            <div className="p-2 border-t border-gray-800 text-xs text-gray-500">
              {openFiles.length} file(s) open
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
                  <p>No file open. Create or select a file from explorer.</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="h-12 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
              {openFiles.length > 0 && (
                <>
                  <span>Language: <span className="text-green-400">{openFiles[activeFile].language}</span></span>
                  <span>•</span>
                  <span>Lines: <span className="text-blue-400">{openFiles[activeFile].content.split('\n').length}</span></span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={openFiles.length === 0}
                className="flex items-center gap-2 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold transition-colors"
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
            <div className="h-48 bg-black border-t-2 border-green-500 flex flex-col">
              <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-400">OUTPUT</span>
                </div>
                <button onClick={() => setOutput('')} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
                <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
          )}

          {/* Terminal Panel */}
          {showTerminal && (
            <div className="h-64 bg-black border-t-2 border-blue-500 flex flex-col">
              <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <TerminalIcon size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-blue-400">TERMINAL</span>
                </div>
                <button onClick={() => setShowTerminal(false)} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-green-400">
                <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
              </div>
              <div className="border-t border-gray-800 p-2 flex items-center gap-2">
                <span className="text-green-400 font-mono text-sm">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeTerminalCommand()}
                  className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-xs"
                  placeholder="Type command..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
