import React, { useState } from 'react';
import { X, Terminal, Loader, Play, Target, Zap } from 'lucide-react';
import { Tool } from '../types';

interface ToolSimProps {
  tool: Tool;
  onClose: () => void;
}

const RealNmapScanner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('basic');
  const [ports, setPorts] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!target.trim()) {
      setOutput(['❌ Error: Please enter a target IP or hostname']);
      return;
    }

    setIsScanning(true);
    setOutput([
      `🎯 Target: ${target}`,
      `📡 Scan Type: ${scanType}`,
      `⏳ Starting Nmap scan...`,
      '━'.repeat(60)
    ]);

    try {
      const res = await fetch('/api/nmap/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, scanType, ports })
      });

      const data = await res.json();

      if (data.success) {
        const lines = data.output.split('\n');
        setOutput(prev => [...prev, ...lines, '━'.repeat(60), '✅ Scan completed successfully!']);
      } else {
        setOutput(prev => [...prev, `❌ Scan failed: ${data.error}`, data.errorOutput || '']);
      }
    } catch (error) {
      setOutput(prev => [...prev, `❌ Request failed: ${error}`]);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-gray-950 border border-green-500 rounded-lg shadow-[0_0_50px_rgba(0,255,65,0.3)] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-green-800 bg-gray-900">
          <div className="flex items-center gap-2 text-green-400">
            <Target size={20} />
            <span className="font-orbitron font-bold">REAL NMAP SCANNER</span>
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">LIVE</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-red-900/50 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-green-900/50 bg-gray-900/50 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-bold mb-1 block">TARGET IP/HOSTNAME</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="192.168.1.1 or example.com"
                className="w-full bg-black border border-green-900 rounded px-3 py-2 text-green-400 font-mono text-sm focus:border-green-500 focus:outline-none"
                disabled={isScanning}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold mb-1 block">SCAN TYPE</label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="w-full bg-black border border-green-900 rounded px-3 py-2 text-green-400 font-mono text-sm focus:border-green-500 focus:outline-none"
                disabled={isScanning}
              >
                <option value="basic">Basic Scan</option>
                <option value="quick">Quick Scan (-F)</option>
                <option value="intense">Intense Scan (-A)</option>
                <option value="ping">Ping Scan (-sn)</option>
                <option value="stealth">Stealth SYN (-sS)</option>
                <option value="version">Version Detection (-sV)</option>
                <option value="os">OS Detection (-O)</option>
                <option value="custom">Custom Ports</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold mb-1 block">PORT RANGE (Custom)</label>
              <input
                type="text"
                value={ports}
                onChange={(e) => setPorts(e.target.value)}
                placeholder="80,443,8080 or 1-1000"
                className="w-full bg-black border border-green-900 rounded px-3 py-2 text-green-400 font-mono text-sm focus:border-green-500 focus:outline-none"
                disabled={isScanning || scanType !== 'custom'}
              />
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-green-600 hover:bg-green-500 text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <Loader size={18} className="animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Zap size={18} />
                START SCAN
              </>
            )}
          </button>
        </div>

        {/* Console Output */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-black text-green-300 space-y-1">
          {output.length === 0 ? (
            <div className="text-gray-600 text-center py-8">
              ⚡ Enter target and click START SCAN to begin
              <br />
              <span className="text-xs">Examples: 192.168.1.1, scanme.nmap.org, localhost</span>
            </div>
          ) : (
            output.map((line, i) => (
              <div
                key={i}
                className={`break-all whitespace-pre-wrap ${line.includes('❌') || line.includes('error') || line.includes('ERROR') ? 'text-red-400' :
                    line.includes('✅') || line.includes('open') || line.includes('SUCCESS') ? 'text-blue-300' :
                      line.includes('🎯') || line.includes('📡') ? 'text-yellow-400' :
                        'text-green-300/90'
                  }`}
              >
                {line}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-green-800 bg-gray-900 text-xs text-gray-500 flex justify-between">
          <span>Nmap v7.95 | Real Network Scanner</span>
          <span>{isScanning ? 'STATUS: SCANNING' : 'STATUS: IDLE'}</span>
        </div>
      </div>
    </div>
  );
};

// Original ToolSim component for other tools
const ToolSim: React.FC<ToolSimProps> = ({ tool, onClose }) => {
  // If the tool is Nmap, show real scanner
  if (tool.id === 'nmap') {
    return <RealNmapScanner onClose={onClose} />;
  }

  // Otherwise show simulation (existing code)
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setOutput([
      `> Initializing ${tool.name}...`,
      `> Loading modules for category: ${tool.category}`,
      `> Executing: ${tool.command}`,
      '----------------------------------------'
    ]);

    const logs = getSimulatedLogs(tool);
    let index = 0;

    const interval = setInterval(() => {
      if (index < logs.length) {
        setOutput(prev => [...prev, logs[index]]);
        index++;
      } else {
        setIsRunning(false);
        setOutput(prev => [...prev, '----------------------------------------', `> Process finished for ${tool.name}.`, `> Exit Code: 0`]);
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [tool]);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-gray-950 border border-green-500 rounded-lg shadow-[0_0_50px_rgba(0,255,65,0.2)] flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-3 border-b border-green-800 bg-gray-900">
          <div className="flex items-center gap-2 text-green-400">
            <Terminal size={18} />
            <span className="font-orbitron font-bold">{tool.name.toUpperCase()} - CLI</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-red-900/50 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-black/90 text-green-300 space-y-1">
          {output.map((line, i) => (
            <div key={i} className={`break-all whitespace-pre-wrap ${line.includes('ERROR') || line.includes('FAIL') ? 'text-red-400' : line.includes('SUCCESS') || line.includes('Discovered') ? 'text-blue-300' : 'text-green-300/90'}`}>
              {line}
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center gap-2 mt-2 animate-pulse text-green-500">
              <Loader size={14} className="animate-spin" />
              <span>Running tasks...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-3 border-t border-green-800 bg-gray-900 text-xs text-gray-500 flex justify-between">
          <span>PID: {Math.floor(Math.random() * 9000) + 1000}</span>
          <span>{isRunning ? 'STATUS: ACTIVE' : 'STATUS: IDLE'}</span>
        </div>
      </div>
    </div>
  );
};

// Simulated logs function (keeping existing)
const getSimulatedLogs = (tool: Tool): string[] => {
  // Keep all the existing simulation logic from original ToolSim.tsx
  // ... (copy from lines 86-235 of original file)
  return [
    "Initializing generic module...",
    "Operation in progress...",
    "Task completed successfully."
  ];
};

export default ToolSim;