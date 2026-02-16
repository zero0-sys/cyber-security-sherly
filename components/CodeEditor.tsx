import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, FolderOpen, File, Plus, Trash2, Download, Code2, Terminal as TerminalIcon, Bug, GitBranch, GitPullRequest, GitCommit, AlertCircle, CheckCircle } from 'lucide-react';

interface Script {
  name: string;
  size: number;
  modified: Date;
}

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState('# Write your code here\nprint("Hello from AI Sherly Lab!")');
  const [language, setLanguage] = useState('python');
  const [filename, setFilename] = useState('script.py');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showScripts, setShowScripts] = useState(true);
  const [bugs, setBugs] = useState<string[]>([]);
  const [gitOutput, setGitOutput] = useState('');
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [gitUrl, setGitUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const editorRef = useRef<any>(null);

  // Load scripts list
  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      const res = await fetch('/api/scripts/list');
      const data = await res.json();
      setScripts(data.files || []);
    } catch (error) {
      console.error('Failed to load scripts:', error);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/scripts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: code })
      });
      const data = await res.json();
      if (data.success) {
        setOutput(`✓ Saved to ${data.path}\n`);
        loadScripts();
      }
    } catch (error) {
      setOutput(`✗ Save failed: ${error}\n`);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setOutput('Executing...\n');

    try {
      const res = await fetch('/api/execute/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, filename })
      });
      const data = await res.json();

      if (data.success) {
        setOutput(`✓ Execution completed\n\n${data.output}${data.error ? `\nErrors:\n${data.error}` : ''}`);
      } else {
        setOutput(`✗ Execution failed\n\n${data.errorOutput || data.error}`);
      }
    } catch (error) {
      setOutput(`✗ Request failed: ${error}\n`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Bug Finder / Linter
  const handleLint = () => {
    const foundBugs: string[] = [];
    const lines = code.split('\n');

    if (language === 'python') {
      // Basic Python linting
      lines.forEach((line, i) => {
        if (line.trim().startsWith('import ') && i > 10) {
          foundBugs.push(`Line ${i + 1}: Import statement should be at the top`);
        }
        if (line.includes('==') && line.includes('True')) {
          foundBugs.push(`Line ${i + 1}: Use 'is True' instead of '== True'`);
        }
        if (/\s+$/.test(line)) {
          foundBugs.push(`Line ${i + 1}: Trailing whitespace detected`);
        }
        if (line.length > 120) {
          foundBugs.push(`Line ${i + 1}: Line too long (${line.length} > 120 chars)`);
        }
      });
    } else if (language === 'javascript' || language === 'typescript') {
      // Basic JS/TS linting
      lines.forEach((line, i) => {
        if (line.includes('var ')) {
          foundBugs.push(`Line ${i + 1}: Use 'let' or 'const' instead of 'var'`);
        }
        if (line.includes('==') && !line.includes('===')) {
          foundBugs.push(`Line ${i + 1}: Use '===' instead of '=='`);
        }
        if (line.match(/console\.log/)) {
          foundBugs.push(`Line ${i + 1}: Remove console.log before production`);
        }
      });
    }

    setBugs(foundBugs);
    setOutput(`🔍 Bug Scan Complete\n\nFound ${foundBugs.length} issue(s):\n\n` +
      (foundBugs.length > 0 ? foundBugs.join('\n') : '✓ No issues found!'));
  };

  // Git Operations
  const handleGitClone = async () => {
    if (!gitUrl.trim()) {
      setGitOutput('❌ Please enter a Git repository URL');
      return;
    }

    setGitOutput('Cloning repository...\n');
    try {
      const res = await fetch('/api/git/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: gitUrl })
      });
      const data = await res.json();

      if (data.success) {
        setGitOutput(`✓ Repository cloned successfully\n\n${data.output}`);
        loadScripts();
      } else {
        setGitOutput(`❌ Clone failed\n\n${data.error}`);
      }
    } catch (error) {
      setGitOutput(`❌ Request failed: ${error}`);
    }
  };

  const handleGitPull = async () => {
    setGitOutput('Pulling latest changes...\n');
    try {
      const res = await fetch('/api/git/pull', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setGitOutput(`✓ Pull successful\n\n${data.output}`);
        loadScripts();
      } else {
        setGitOutput(`❌ Pull failed\n\n${data.error}`);
      }
    } catch (error) {
      setGitOutput(`❌ Request failed: ${error}`);
    }
  };

  const handleGitCommit = async () => {
    if (!commitMessage.trim()) {
      setGitOutput('❌ Please enter a commit message');
      return;
    }

    setGitOutput('Committing changes...\n');
    try {
      const res = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage })
      });
      const data = await res.json();

      if (data.success) {
        setGitOutput(`✓ Commit successful\n\n${data.output}`);
        setCommitMessage('');
      } else {
        setGitOutput(`❌ Commit failed\n\n${data.error}`);
      }
    } catch (error) {
      setGitOutput(`❌ Request failed: ${error}`);
    }
  };

  const handleGitPush = async () => {
    setGitOutput('Pushing to remote...\n');
    try {
      const res = await fetch('/api/git/push', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setGitOutput(`✓ Push successful\n\n${data.output}`);
      } else {
        setGitOutput(`❌ Push failed\n\n${data.error}`);
      }
    } catch (error) {
      setGitOutput(`❌ Request failed: ${error}`);
    }
  };

  const handleLoadScript = async (scriptName: string) => {
    try {
      const res = await fetch(`/api/scripts/load?filename=${encodeURIComponent(scriptName)}`);
      const data = await res.json();
      setCode(data.content);
      setFilename(scriptName);

      // Detect language from extension
      const ext = scriptName.split('.').pop()?.toLowerCase();
      if (ext === 'py') setLanguage('python');
      else if (ext === 'js') setLanguage('javascript');
      else if (ext === 'sh') setLanguage('shell');
      else if (ext === 'ts') setLanguage('typescript');
      else if (ext === 'java') setLanguage('java');
      else if (ext === 'cpp' || ext === 'cc') setLanguage('cpp');
      else if (ext === 'c') setLanguage('c');
      else if (ext === 'go') setLanguage('go');
      else if (ext === 'rs') setLanguage('rust');

      setOutput(`✓ Loaded ${scriptName}\n`);
    } catch (error) {
      setOutput(`✗ Load failed: ${error}\n`);
    }
  };

  const handleNewFile = () => {
    const ext = language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'shell' ? 'sh' : 'txt';
    setFilename(`new_file.${ext}`);
    setCode(`// New ${language} file\n\n`);
    setOutput('');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const ext = lang === 'python' ? 'py' : lang === 'javascript' ? 'js' : lang === 'shell' ? 'sh' : 'txt';
    setFilename(filename.replace(/\.[^.]+$/, `.${ext}`));
  };

  return (
    <div className="flex h-full bg-black">
      {/* Sidebar - File Browser */}
      {showScripts && (
        <div className="w-64 border-r border-green-900 flex flex-col bg-black/40">
          <div className="p-3 border-b border-green-900">
            <h3 className="font-orbitron font-bold text-white flex items-center gap-2">
              <FolderOpen size={16} className="text-green-500" />
              SCRIPTS
            </h3>
          </div>

          <div className="p-2">
            <button
              onClick={handleNewFile}
              className="w-full flex items-center gap-2 px-3 py-2 rounded bg-green-600 hover:bg-green-500 text-black font-bold text-sm transition-colors"
            >
              <Plus size={16} />
              New File
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {scripts.map((script) => (
              <button
                key={script.name}
                onClick={() => handleLoadScript(script.name)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left text-sm transition-colors ${script.name === filename
                  ? 'bg-green-900/30 text-green-400 border border-green-900'
                  : 'text-gray-400 hover:bg-green-900/10 hover:text-green-300'
                  }`}
              >
                <File size={14} />
                <span className="flex-1 truncate">{script.name}</span>
              </button>
            ))}

            {scripts.length === 0 && (
              <div className="text-xs text-gray-600 text-center py-8">
                No scripts yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-green-900 bg-black">
          <div className="flex items-center gap-3">
            <Code2 size={20} className="text-green-500" />
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="bg-black border border-green-900 rounded px-3 py-1 text-green-400 font-mono text-sm focus:border-green-500 focus:outline-none"
            />

            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-black border border-green-900 rounded px-3 py-1 text-green-400 font-mono text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="shell">Bash</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLint}
              className="flex items-center gap-2 px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-sm transition-colors"
              title="Find Bugs"
            >
              <Bug size={16} />
              Lint
            </button>

            <button
              onClick={() => setShowGitPanel(!showGitPanel)}
              className="flex items-center gap-2 px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors"
              title="Git Operations"
            >
              <GitBranch size={16} />
              Git
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={handleExecute}
              disabled={isExecuting || !['python', 'javascript', 'shell'].includes(language)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-black font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              {isExecuting ? 'Running...' : 'Execute'}
            </button>
          </div>
        </div>

        {/* Git Panel */}
        {showGitPanel && (
          <div className="p-3 border-b border-green-900 bg-gray-900/50">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch size={16} className="text-purple-500" />
              <h3 className="font-bold text-white text-sm">GIT OPERATIONS</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/user/repo.git"
                  className="w-full bg-black border border-green-900 rounded px-3 py-2 text-green-400 font-mono text-xs focus:border-green-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleGitClone}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
              >
                <Download size={14} />
                Clone
              </button>
              <button
                onClick={handleGitPull}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                <GitPullRequest size={14} />
                Pull
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Commit message..."
                className="bg-black border border-green-900 rounded px-3 py-2 text-green-400 font-mono text-xs focus:border-green-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleGitCommit}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-green-600 hover:bg-green-500 text-black font-bold text-xs transition-colors"
                >
                  <GitCommit size={14} />
                  Commit
                </button>
                <button
                  onClick={handleGitPush}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors"
                >
                  Push
                </button>
              </div>
            </div>

            {gitOutput && (
              <div className="mt-2 p-2 bg-black border border-purple-900 rounded text-xs text-purple-400 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                {gitOutput}
              </div>
            )}
          </div>
        )}

        {/* Bug Display */}
        {bugs.length > 0 && (
          <div className="p-3 border-b border-yellow-900 bg-yellow-900/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-yellow-500" />
              <h3 className="font-bold text-white text-sm">{bugs.length} ISSUE(S) FOUND</h3>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {bugs.slice(0, 5).map((bug, i) => (
                <div key={i} className="text-xs text-yellow-400 font-mono">
                  • {bug}
                </div>
              ))}
              {bugs.length > 5 && (
                <div className="text-xs text-gray-500">... and {bugs.length - 5} more</div>
              )}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => { setCode(value || ''); setBugs([]); }}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: '"Cascadia Code", "Fira Code", Consolas, monospace',
              lineNumbers: 'on',
              rulers: [80, 120],
              formatOnPaste: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 4,
              insertSpaces: true,
            }}
          />
        </div>

        {/* Output Terminal */}
        <div className="h-48 border-t border-green-900 bg-black flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-green-900/50">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <TerminalIcon size={14} className="text-green-500" />
              LIVE OUTPUT
              {isExecuting && <span className="animate-pulse text-yellow-400 text-xs">● RUNNING</span>}
            </div>
            <button
              onClick={() => { setOutput(''); setBugs([]); }}
              className="text-xs text-gray-500 hover:text-green-400"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-green-400 whitespace-pre-wrap">
            {output || '⚡ Ready to execute. Click Execute to run your code or Lint to find bugs.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
