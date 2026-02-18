import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Activity, Terminal as TerminalIcon,
  Zap, FileText, Info, Globe, Lock, Search,
  Wifi, Bot, Database, Menu, X, ChevronRight, Server, Eye, Cpu, Radio, Layers,
  Bug, User, Laptop, Key, Map as MapIcon, Crosshair, Skull, UserCheck, Users, Target, Code, ShieldAlert, LogOut,
  Disc, FolderOpen, Smartphone, Share2, Gamepad2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';

import Terminal from './components/Terminal';
import AttackSim from './components/AttackSim';
import AiChat from './components/AiChat';
import DatabaseViewer from './components/DatabaseViewer';
import ToolSim from './components/ToolSim';
import RatSim from './components/RatSim';
import CryptoLab from './components/CryptoLab';
import WorldMap from './components/WorldMap';
import DigitalSoul from './components/DigitalSoul';
import TargetList from './components/TargetList';
import CodeEditor from './components/CodeEditor';
import LoginScreen from './components/LoginScreen';
import LoginPage from './components/LoginPage';
import SecretPage from './components/SecretPage';
import FunHub from './components/FunHub';
import { TabType, LogEntry, Tool } from './types';

// --- Main App Component ---
const App: React.FC = () => {
  // No login gates — always authenticated
  const [morseUnlocked] = useState(true);
  const [showSecretPage] = useState(false);
  const [isAuthenticated] = useState(true);
  const [username] = useState('operator');

  // Restore navigation state from localStorage
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('sherlyActiveTab');
    return (saved as TabType) || 'dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkData, setNetworkData] = useState<any[]>([]);
  const [freqData, setFreqData] = useState<any[]>([]);
  const [honeypotData, setHoneypotData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    threats: 0,
    blocked: 0,
    networkLoad: 0
  });

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('sherlyActiveTab', activeTab);
    }
  }, [activeTab, isAuthenticated]);

  // Logout handler (reloads page to reset state)
  const handleLogout = () => {
    localStorage.removeItem('sherlySession');
    localStorage.removeItem('sherlyActiveTab');
    window.location.reload();
  };

  // Data Simulation Effect (Only runs if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Init Frequency Data
    const initFreq = Array.from({ length: 20 }, (_, i) => ({
      band: `${(i * 100)}MHz`,
      val: Math.random() * 100
    }));
    setFreqData(initFreq);

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();

      // Update Chart Data
      setNetworkData(prev => {
        const newData = [...prev, {
          time: now,
          inbound: Math.floor(Math.random() * 100) + 20,
          outbound: Math.floor(Math.random() * 80) + 10,
        }];
        return newData.slice(-20);
      });

      // Update Frequency Data
      setFreqData(prev => prev.map(item => ({
        ...item,
        val: Math.max(10, Math.min(100, item.val + (Math.random() - 0.5) * 60))
      })));

      // Update Honeypot Data
      setHoneypotData(prev => {
        const protocols = ['SSH', 'FTP', 'HTTP', 'SMB', 'RDP'];
        const randomProto = protocols[Math.floor(Math.random() * protocols.length)];
        const newData = [...prev, {
          protocol: randomProto,
          attacks: Math.floor(Math.random() * 50)
        }];
        if (newData.length > 5) return newData.slice(1);
        return newData;
      });

      // Update Stats
      setStats(prev => ({
        threats: prev.threats + (Math.random() > 0.8 ? 1 : 0),
        blocked: prev.blocked + (Math.random() > 0.7 ? 1 : 0),
        networkLoad: Math.floor(Math.random() * 40) + 30
      }));

      // Random Logs
      if (Math.random() > 0.7) {
        const msgs = [
          "Port scan terdeteksi dari 103.20.x.x",
          "Login SSH gagal untuk user 'admin'",
          "Lonjakan traffic outbound terdeteksi",
          "Signature Malware diblokir oleh Firewall",
          "Query DNS ke domain berbahaya (Judi Online)",
          "AI Sherly menganalisis anomali paket",
          "Rule Firewall diperbarui otomatis",
          "Honeypot 'Zeus' menangkap payload baru",
          "Koneksi RDP mencurigakan dari IP Rusia"
        ];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        const type = msg.includes("diblokir") || msg.includes("diperbarui") ? "success" : msg.includes("terdeteksi") || msg.includes("mencurigakan") ? "warning" : "info";

        setLogs(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          timestamp: now,
          message: msg,
          type: type as any
        }, ...prev].slice(0, 10));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);


  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView stats={stats} networkData={networkData} logs={logs} honeypotData={honeypotData} freqData={freqData} />;
      case 'terminal':
        return <Terminal />;
      case 'attack':
        return <AttackSim />;
      case 'c2':
        return <RatSim />;
      case 'crypto':
        return <CryptoLab />;
      case 'ai_chat':
        return <AiChat />;
      case 'database':
        return <DatabaseViewer />;
      case 'map':
        return <WorldMap />;
      case 'avatar':
        return <DigitalSoul />;
      case 'targets':
        return <TargetList />;
      case 'tools':
        return <ToolsView onLaunch={(tool) => setActiveTool(tool)} />;
      case 'code_editor':
        return <CodeEditor />;
      case 'fun':
        return <FunHub />;
      case 'docs':
        return <DocsView />;
      case 'about':
        return <AboutView />;
      default:
        return <div className="p-10 text-center text-xl">Module Under Construction</div>;
    }
  };

  // Use h-[100dvh] for better mobile support (addresses the "can't move" issue on mobile browsers)
  return (
    <div className="flex h-[100dvh] bg-black text-green-400 overflow-hidden relative font-mono selection:bg-green-500 selection:text-black">

      {/* Desktop Sidebar */}
      <aside className="w-64 z-30 bg-black border-r border-green-900 flex flex-col hidden md:flex shrink-0">
        <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} username={username} onLogout={handleLogout} />
      </aside>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 md:hidden flex flex-col animate-in fade-in slide-in-from-left-10 duration-200">
          <div className="flex justify-between items-center p-4 border-b border-green-900">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-green-500" />
              <span className="font-orbitron font-bold">MENU</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-green-500 p-1 border border-transparent hover:border-green-500 rounded transition-all">
              <X size={24} />
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} username={username} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 z-10 flex flex-col relative h-full transition-all bg-black min-w-0">
        {/* Header Mobile & Desktop Info Bar */}
        <header className="shrink-0 p-3 border-b border-green-900 flex justify-between items-center bg-black">
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="text-green-500" size={24} />
            <span className="font-bold font-orbitron text-white text-lg">AI SHERLY</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-mono ml-auto">
            <div className="flex items-center gap-2 text-gray-400 bg-gray-900/50 px-2 py-1 rounded border border-green-900/30">
              <User size={14} />
              <span>OPERATOR: <span className="text-green-400 font-bold uppercase">{username}</span></span>
            </div>
            <div className="h-4 w-px bg-green-900"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Radio size={14} className="text-green-500 animate-pulse" />
              <span>UPLINK ESTABLISHED</span>
            </div>
          </div>

          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-green-500 hover:text-white transition-colors bg-green-900/20 p-2 rounded border border-green-900/50">
            <Menu size={24} />
          </button>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 p-2 md:p-4 lg:p-6 overflow-hidden relative bg-black">
          {renderContent()}
        </div>
      </main>

      {/* Tool Simulation Modal */}
      {activeTool && (
        <ToolSim tool={activeTool} onClose={() => setActiveTool(null)} />
      )}

      {/* Visual Effects */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-50"></div>
    </div>
  );
};

// --- Sub Components ---

const SidebarContent: React.FC<{ activeTab: TabType, onTabChange: (t: TabType) => void, username: string, onLogout: () => void }> = ({ activeTab, onTabChange, username, onLogout }) => (
  <>
    <div className="p-6 border-b border-green-900 flex items-center gap-3">
      <div className="relative group">
        <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center group-hover:shadow-[0_0_15px_#00ff41] transition-shadow bg-black">
          <Shield size={24} className="group-hover:animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-bounce"></div>
      </div>
      <div className="overflow-hidden">
        <h1 className="font-bold font-orbitron text-lg tracking-wider text-white whitespace-nowrap">AI SHERLY</h1>
        <p className="text-[10px] text-green-600 tracking-[0.2em] font-bold">SEC_OPS_CENTER</p>
      </div>
    </div>

    <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">

      {/* Mobile User Info Display */}
      <div className="md:hidden mb-4 p-3 bg-green-900/10 border border-green-900 rounded flex items-center gap-3">
        <div className="bg-black p-1.5 rounded-full border border-green-500">
          <User size={16} />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-[10px] text-gray-500 uppercase">Current Agent</div>
          <div className="text-sm font-bold text-white truncate">{username}</div>
        </div>
      </div>

      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-2 font-bold px-2">Core Modules</div>
      <NavButton active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} icon={<Activity size={18} />} label="Dashboard" />
      <NavButton active={activeTab === 'ai_chat'} onClick={() => onTabChange('ai_chat')} icon={<Bot size={18} />} label="AI Sherly Chat" badge="AI" />
      <NavButton active={activeTab === 'terminal'} onClick={() => onTabChange('terminal')} icon={<TerminalIcon size={18} />} label="Terminal CLI" />
      <NavButton active={activeTab === 'map'} onClick={() => onTabChange('map')} icon={<MapIcon size={18} />} label="Global Threat Map" badge="LIVE" />
      <NavButton active={activeTab === 'avatar'} onClick={() => onTabChange('avatar')} icon={<UserCheck size={18} />} label="Digital Soul" />

      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-6 font-bold px-2">Offensive Ops</div>
      <NavButton active={activeTab === 'targets'} onClick={() => onTabChange('targets')} icon={<Target size={18} />} label="Wanted List" badge="NEW" />
      <NavButton active={activeTab === 'tools'} onClick={() => onTabChange('tools')} icon={<Search size={18} />} label="Tool Armory" />
      <NavButton active={activeTab === 'code_editor'} onClick={() => onTabChange('code_editor')} icon={<Code size={18} />} label="Code Editor" />
      <NavButton active={activeTab === 'fun'} onClick={() => onTabChange('fun')} icon={<Gamepad2 size={18} />} label="Fun" badge="UBER" />
      <NavButton active={activeTab === 'attack'} onClick={() => onTabChange('attack')} icon={<Zap size={18} />} label="Attack Tools" />
      <NavButton active={activeTab === 'c2'} onClick={() => onTabChange('c2')} icon={<Laptop size={18} />} label="Command & Control" badge="RAT" />
      <NavButton active={activeTab === 'crypto'} onClick={() => onTabChange('crypto')} icon={<Key size={18} />} label="Cryptography" />
      <NavButton active={activeTab === 'database'} onClick={() => onTabChange('database')} icon={<Database size={18} />} label="Data Breach" badge="LEAK" />

      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-6 font-bold px-2">System</div>
      <NavButton active={activeTab === 'docs'} onClick={() => onTabChange('docs')} icon={<FileText size={18} />} label="Documentation" />
      <NavButton active={activeTab === 'about'} onClick={() => onTabChange('about')} icon={<Info size={18} />} label="System Info" />

      <div className="mt-8 pt-4 border-t border-green-900/30">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded text-red-500 hover:bg-red-900/20 hover:text-red-400 transition-colors group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">DISCONNECT</span>
        </button>
      </div>
    </nav>

    <div className="p-4 border-t border-green-900 bg-black/20 hidden md:block">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>STATUS UPLINK</span>
        <span className="text-green-500 animate-pulse">AMAN</span>
      </div>
      <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
        <div className="bg-green-500 h-full w-[85%]"></div>
      </div>
      <p className="font-mono mt-2 text-xs text-green-800 text-center">IP: 103.14.88.2 [VPN]</p>
    </div>
  </>
);

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: string }> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded transition-all duration-200 group relative overflow-hidden ${active
      ? 'bg-green-900/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(0,255,65,0.1)] translate-x-1'
      : 'text-gray-400 hover:text-green-300 hover:bg-green-500/5 hover:translate-x-1'
      }`}
  >
    <div className="flex items-center gap-3 relative z-10">
      {icon}
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </div>
    {active && <ChevronRight size={16} className="text-green-500 animate-pulse" />}
    {badge && !active && <span className="text-[9px] bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded border border-red-900">{badge}</span>}
  </button>
);

const DashboardView: React.FC<any> = ({ stats, networkData, logs, honeypotData, freqData }) => (
  <div className="space-y-6 overflow-y-auto h-full pb-20 scrollbar-hide">
    {/* Top Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Active Threats" value={stats.threats} icon={<Zap size={20} className="text-red-500" />} color="red" />
      <StatCard label="Mitigated Attacks" value={stats.blocked} icon={<Shield size={20} className="text-green-500" />} color="green" />
      <StatCard label="Net Traffic" value={`${stats.networkLoad}%`} icon={<Activity size={20} className="text-blue-500" />} color="blue" />
      <StatCard label="System Integrity" value="98.2%" icon={<Lock size={20} className="text-green-400" />} color="green" />
    </div>

    {/* Main Charts Area */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Network Traffic */}
      <div className="lg:col-span-2 glass-panel p-4 rounded-lg h-64 md:h-80 relative overflow-hidden border border-green-900 bg-black/40 flex flex-col">
        <h3 className="text-lg font-orbitron mb-4 flex items-center gap-2 relative z-10">
          <Activity size={18} className="text-green-500" /> Real-time Traffic Analysis
        </h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={networkData}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0096ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0096ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tick={{ fill: '#6b7280' }} />
              <YAxis stroke="#4b5563" fontSize={10} tick={{ fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#00ff41', color: '#00ff41', fontFamily: 'monospace' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="inbound" stroke="#00ff41" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
              <Area type="monotone" dataKey="outbound" stroke="#0096ff" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Frequency Spectrum Graph */}
      <div className="glass-panel p-4 rounded-lg border border-green-900 bg-black/40 flex flex-col relative overflow-hidden h-64 md:h-80">
        <h3 className="text-lg font-orbitron mb-4 flex items-center gap-2 relative z-10">
          <Radio size={18} className="text-yellow-500 animate-pulse" /> RF Spectrum Analyzer
        </h3>
        <div className="flex-1 relative bg-gray-900/20 rounded border border-green-900/30 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={freqData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="band" hide />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#eab308', color: '#eab308', fontFamily: 'monospace' }}
              />
              <Bar dataKey="val" fill="#eab308" animationDuration={300}>
                {
                  freqData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fillOpacity={0.4 + (entry.val / 200)} fill={entry.val > 80 ? '#ef4444' : '#eab308'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-gray-500 font-mono">
          <span>2.4 GHz</span>
          <span>BANDWIDTH: 40MHz</span>
          <span>5.0 GHz</span>
        </div>
      </div>
    </div>

    {/* Bottom Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Logs */}
      <div className="lg:col-span-2 glass-panel p-4 rounded-lg border border-green-900 bg-black/40">
        <h3 className="text-lg font-orbitron mb-3 flex items-center gap-2">
          <TerminalIcon size={18} /> System Event Logs
        </h3>
        <div className="space-y-1 max-h-60 overflow-y-auto pr-2 font-mono text-xs">
          {logs.map((log: LogEntry) => (
            <div key={log.id} className="flex gap-3 p-2 bg-black/40 rounded border-l-2 border-green-500/20 hover:bg-green-500/5 hover:border-green-500 transition-all">
              <span className="text-gray-500 shrink-0">{log.timestamp}</span>
              <span className={`break-words ${log.type === 'warning' ? 'text-yellow-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-300'}`}>
                {log.type.toUpperCase()}: {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Honeypot Stats */}
      <div className="glass-panel p-4 rounded-lg flex flex-col border border-green-900 bg-black/40">
        <h3 className="text-lg font-orbitron mb-3 flex items-center gap-2">
          <Crosshair size={18} className="text-purple-500" /> Honeypot Hits
        </h3>
        <div className="flex-1 min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={honeypotData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="protocol" stroke="#6b7280" fontSize={10} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#00ff41', color: '#00ff41', fontFamily: 'monospace' }}
              />
              <Bar dataKey="attacks" fill="#8884d8" barSize={20}>
                {
                  honeypotData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#a855f7' : '#ec4899'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const ToolsView: React.FC<{ onLaunch: (t: Tool) => void }> = ({ onLaunch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // REAL-WORLD CYBERSECURITY TOOLS LIST
  const realTools: Tool[] = [
    // RECONNAISSANCE
    { id: 'nmap', name: "Nmap", description: "Network exploration and security auditing.", category: "Recon", icon: <Globe />, command: 'nmap -sV -A target' },
    { id: 'shodan', name: "Shodan CLI", description: "Search engine for Internet-connected devices.", category: "Recon", icon: <Search />, command: 'shodan host target.com' },
    { id: 'recon-ng', name: "Recon-ng", description: "Full-featured web reconnaissance framework.", category: "Recon", icon: <Search />, command: 'recon-ng' },
    { id: 'maltego', name: "Maltego", description: "Interactive data mining and link analysis.", category: "Recon", icon: <Activity />, command: './maltego' },
    { id: 'spiderfoot', name: "SpiderFoot", description: "Open source intelligence (OSINT) automation.", category: "Recon", icon: <Bot />, command: 'spiderfoot -l :5001' },
    { id: 'amass', name: "Amass", description: "In-depth DNS enumeration and attack surface mapping.", category: "Recon", icon: <Globe />, command: 'amass enum -d target.com' },
    { id: 'theharvester', name: "theHarvester", description: "E-mail, subdomain and people harvesting tool.", category: "Recon", icon: <User />, command: 'theHarvester -d target.com -b google' },

    // EXPLOITATION
    { id: 'metasploit', name: "Metasploit", description: "Penetration testing software for exploits.", category: "Exploit", icon: <Zap />, command: 'msfconsole' },
    { id: 'cobaltstrike', name: "Cobalt Strike", description: "Adversary simulation and Red Team operations.", category: "Exploit", icon: <Target />, command: './teamserver' },
    { id: 'empire', name: "PowerShell Empire", description: "Post-exploitation framework.", category: "Exploit", icon: <TerminalIcon />, command: './empire' },
    { id: 'armitage', name: "Armitage", description: "GUI for Metasploit.", category: "Exploit", icon: <Zap />, command: 'armitage' },
    { id: 'sqlmap', name: "SQLMap", description: "Automatic SQL injection and database takeover.", category: "Exploit", icon: <Database />, command: 'sqlmap -u "http://target.com?id=1" --dbs' },
    { id: 'beef', name: "BeEF", description: "Browser Exploitation Framework.", category: "Exploit", icon: <Globe />, command: './beef' },
    { id: 'commando', name: "Commando VM", description: "Windows-based penetration testing distro.", category: "Exploit", icon: <Laptop />, command: 'start-vm' },

    // SNIFFING & SPOOFING
    { id: 'wireshark', name: "Wireshark", description: "World's foremost network protocol analyzer.", category: "Sniffing", icon: <Activity />, command: 'wireshark' },
    { id: 'tcpdump', name: "Tcpdump", description: "Command-line packet analyzer.", category: "Sniffing", icon: <TerminalIcon />, command: 'tcpdump -i eth0' },
    { id: 'bettercap', name: "Bettercap", description: "Swiss army knife for network attacks and monitoring.", category: "Sniffing", icon: <Wifi />, command: 'bettercap' },
    { id: 'ettercap', name: "Ettercap", description: "Comprehensive suite for man-in-the-middle attacks.", category: "Sniffing", icon: <Layers />, command: 'ettercap -G' },
    { id: 'responder', name: "Responder", description: "LLMNR, NBT-NS and MDNS poisoner.", category: "Sniffing", icon: <Radio />, command: 'python Responder.py -I eth0' },

    // PASSWORD CRACKING
    { id: 'john', name: "John the Ripper", description: "Fast password cracker.", category: "Cracking", icon: <Lock />, command: 'john hash.txt' },
    { id: 'hashcat', name: "Hashcat", description: "World's fastest password recovery utility.", category: "Cracking", icon: <Cpu />, command: 'hashcat -m 0 -a 0 hash.txt rockyou.txt' },
    { id: 'hydra', name: "Hydra", description: "Parallelized login cracker (SSH, FTP, etc).", category: "Cracking", icon: <Key />, command: 'hydra -l user -P pass.txt ssh://target' },
    { id: 'medusa', name: "Medusa", description: "Speedy, parallel, and modular login brute-forcer.", category: "Cracking", icon: <Lock />, command: 'medusa -h target -u admin -P pass.txt -M ssh' },
    { id: 'mimikatz', name: "Mimikatz", description: "Extracts plain-texts passwords, hash, PIN code from memory.", category: "Cracking", icon: <Users />, command: 'mimikatz.exe' },
    { id: 'ophcrack', name: "Ophcrack", description: "Windows password cracker based on rainbow tables.", category: "Cracking", icon: <Disc />, command: 'ophcrack' },

    // WEB SCANNERS
    { id: 'burp', name: "Burp Suite", description: "Platform for performing security testing of web applications.", category: "Web", icon: <Globe />, command: 'burpsuite' },
    { id: 'owaspzap', name: "OWASP ZAP", description: "Integrated penetration testing tool for web apps.", category: "Web", icon: <ShieldAlert />, command: 'zap.sh' },
    { id: 'nikto', name: "Nikto", description: "Web server scanner.", category: "Web", icon: <Search />, command: 'nikto -h target.com' },
    { id: 'wpscan', name: "WPScan", description: "WordPress security scanner.", category: "Web", icon: <Bug />, command: 'wpscan --url target.com' },
    { id: 'dirb', name: "Dirb", description: "Web content scanner (directory bruteforce).", category: "Web", icon: <FolderOpen />, command: 'dirb http://target.com' },
    { id: 'gobuster', name: "Gobuster", description: "Directory/File, DNS and VHost busting tool.", category: "Web", icon: <TerminalIcon />, command: 'gobuster dir -u http://target.com -w list.txt' },

    // WIRELESS
    { id: 'aircrack', name: "Aircrack-ng", description: "WiFi network security auditing suite.", category: "Wireless", icon: <Wifi />, command: 'aircrack-ng' },
    { id: 'kismet', name: "Kismet", description: "Wireless network detector, sniffer, and intrusion detection system.", category: "Wireless", icon: <Radio />, command: 'kismet' },
    { id: 'wifite', name: "Wifite", description: "Automated wireless attack tool.", category: "Wireless", icon: <Wifi />, command: 'wifite' },
    { id: 'fern', name: "Fern WiFi Cracker", description: "Wireless security auditing software.", category: "Wireless", icon: <Lock />, command: 'fern-wifi-cracker' },

    // FORENSICS & REVERSE ENGINEERING
    { id: 'autopsy', name: "Autopsy", description: "Digital forensics platform.", category: "Forensics", icon: <Search />, command: 'autopsy' },
    { id: 'volatility', name: "Volatility", description: "Memory forensics framework.", category: "Forensics", icon: <Cpu />, command: 'vol.py -f image.mem imageinfo' },
    { id: 'ghidra', name: "Ghidra", description: "Software reverse engineering suite (NSA).", category: "Reverse", icon: <Code />, command: './ghidraRun' },
    { id: 'ida', name: "IDA Pro", description: "Multi-processor disassembler and debugger.", category: "Reverse", icon: <Bug />, command: 'ida64' },
    { id: 'radare2', name: "Radare2", description: "Unix-like reverse engineering framework.", category: "Reverse", icon: <TerminalIcon />, command: 'r2 target_bin' },

    // VULNERABILITY SCANNERS
    { id: 'nessus', name: "Nessus", description: "Proprietary vulnerability scanner.", category: "Scanner", icon: <Activity />, command: '/etc/init.d/nessusd start' },
    { id: 'openvas', name: "OpenVAS", description: "Full-featured vulnerability scanner.", category: "Scanner", icon: <Shield />, command: 'openvas-start' },
    { id: 'nexpose', name: "Nexpose", description: "Vulnerability management software.", category: "Scanner", icon: <Search />, command: './nexpose' },

    // MOBILE
    { id: 'mobsf', name: "MobSF", description: "Mobile Security Framework (Android/iOS).", category: "Mobile", icon: <Smartphone />, command: './run.sh' },
    { id: 'frida', name: "Frida", description: "Dynamic instrumentation toolkit.", category: "Mobile", icon: <Code />, command: 'frida -U target_app' },

    // POST EXPLOITATION & LATERAL MOVEMENT
    { id: 'bloodhound', name: "BloodHound", description: "Active Directory trust relationship analysis.", category: "Post-Exp", icon: <Share2 />, command: './BloodHound' },
    { id: 'crackmapexec', name: "CrackMapExec", description: "Post-exploitation tool for pentesting networks.", category: "Post-Exp", icon: <Server />, command: 'cme smb 192.168.1.0/24' },
  ];

  const tools = realTools;

  const filteredTools = useMemo(() => {
    return tools.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar for Tools */}
      <div className="p-4 border-b border-green-900 flex items-center gap-4 bg-black">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search Database (e.g., 'wifi', 'scan', 'password')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-green-900 rounded pl-10 pr-4 py-2 text-green-400 placeholder-green-800 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div className="text-xs text-gray-500 font-mono hidden md:block">
          DATABASE: {tools.length} PREMIUM TOOLS LOADED
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 bg-black">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <div key={tool.id} onClick={() => onLaunch(tool)} className="glass-panel p-4 rounded-lg hover:border-green-400 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,255,65,0.1)] flex flex-col h-40 border border-green-900 bg-black/40">
              <div className="flex justify-between items-start mb-2">
                <div className="text-green-500 group-hover:scale-110 transition-transform duration-300 bg-green-900/20 p-2 rounded-lg border border-green-900">
                  {tool.icon}
                </div>
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${tool.category === 'Recon' ? 'bg-blue-900/40 text-blue-400' :
                  tool.category === 'Web' ? 'bg-orange-900/40 text-orange-400' :
                    tool.category === 'Cracking' ? 'bg-red-900/40 text-red-400' :
                      tool.category === 'Exploit' ? 'bg-purple-900/40 text-purple-400' :
                        'bg-gray-800 text-gray-400'
                  }`}>{tool.category}</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1 font-orbitron truncate">{tool.name}</h4>
              <p className="text-xs text-gray-400 mb-auto line-clamp-2">{tool.description}</p>
              <div className="flex items-center text-[10px] text-green-500 font-bold opacity-60 group-hover:opacity-100 transition-opacity mt-2">
                <TerminalIcon size={10} className="mr-1" /> LAUNCH CLI
              </div>
            </div>
          ))}
        </div>
        {filteredTools.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>No tools found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ... DocsView, AboutView, StatCard, ResourceBar remain the same ...
const DocsView = () => (
  <div className="glass-panel p-4 md:p-8 rounded-lg h-full overflow-y-auto border border-green-900 bg-black/40">
    <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
      <FileText size={32} className="text-green-500" />
      <h2 className="text-2xl font-orbitron text-white">System Documentation</h2>
    </div>
    <div className="space-y-8 text-gray-300 max-w-4xl pb-10">

      <section>
        <h3 className="text-green-400 text-lg font-bold mb-2 flex items-center gap-2 font-orbitron"><Info size={16} /> 1.0 Overview</h3>
        <p className="leading-relaxed mb-4">
          AI Sherly is an advanced, high-fidelity cyber security simulation environment designed for educational purposes. It replicates a Security Operations Center (SOC) dashboard, providing tools for network analysis, threat detection, and offensive security simulations. The system is built on a Kali Linux Rolling kernel foundation, providing a realistic environment for security professionals and students.
        </p>
      </section>

      <section>
        <h3 className="text-green-400 text-lg font-bold mb-2 flex items-center gap-2 font-orbitron"><Activity size={16} /> 2.0 Core Modules</h3>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">2.1 Dashboard</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            The central command hub providing real-time situational awareness.
            <br />• <strong>Network Traffic Analysis:</strong> Monitors inbound and outbound packet flow in real-time.
            <br />• <strong>RF Spectrum Analyzer:</strong> Visualizes radio frequency activity across 2.4GHz and 5.0GHz bands.
            <br />• <strong>System Event Logs:</strong> Stream of latest security events, warnings, and system alerts.
            <br />• <strong>Honeypot Stats:</strong> Tracks interception rates across SSH, FTP, HTTP, and other protocols.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">2.2 AI Sherly Chat</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            An intelligent assistant powered by generative AI. Capable of explaining complex security concepts, generating code snippets (Python, Bash, etc.), helping with penetration testing methodologies, and providing real-time guidance on tool usage.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">2.3 Terminal CLI</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            A fully simulated Kali Linux terminal environment.
            <br />• Supports standard commands: <code>ls</code>, <code>cd</code>, <code>cat</code>, <code>whoami</code>.
            <br />• Specialized security tools: <code>nmap</code> (network scanning), <code>hydra</code> (brute force), <code>sqlmap</code> (database injection).
            <br />• File system navigation and script execution capabilities.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">2.4 Global Threat Map</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            Interactive 3D geospatial visualization of cyber attacks. Tracks origin and destination of threats, displaying attack types (DDoS, Malware, Phishing) and intensity in real-time.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-green-400 text-lg font-bold mb-2 flex items-center gap-2 font-orbitron"><Zap size={16} /> 3.0 Offensive Operations</h3>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">3.1 Wanted List (Targets)</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            Database of high-value targets (HVT). Displays profiles, criminal records, bounties, and current status (Active, Captured, MIA). Used for tracking cybercriminals and nation-state actors.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">3.2 Tool Armory</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            Comprehensive catalog of elite cybersecurity tools categorized by function:
            <br />• <strong>Reconnaissance:</strong> Nmap, Shodan, Maltego.
            <br />• <strong>Exploitation:</strong> Metasploit, Cobalt Strike, SQLMap.
            <br />• <strong>Sniffing:</strong> Wireshark, Bettercap.
            <br />• <strong>Cracking:</strong> John the Ripper, Hashcat, Hydra.
            <br />• <strong>Privacy:</strong> Tor, Proxychains.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">3.3 Attack Tools</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            Dedicated interface for launching specific attack vectors:
            <br />• <strong>SQL Injection:</strong> Test database vulnerabilities.
            <br />• <strong>XSS (Cross-Site Scripting):</strong> Validate input sanitization.
            <br />• <strong>Brute Force:</strong> Test password strength against dictionaries.
            <br />• <strong>DDoS Simulation:</strong> Stress test network resilience.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">3.4 Command & Control (C2)</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            Remote Access Trojan (RAT) management dashboard. Monitor infected bots, send commands to zombie networks, manage botnets, and visualize global infection spread.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-green-400 text-lg font-bold mb-2 flex items-center gap-2 font-orbitron"><Lock size={16} /> 4.0 Security & Utilities</h3>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">4.1 Cryptography Lab</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            Advanced suite for encryption and hashing operations.
            <br />• <strong>Hashing:</strong> MD5, SHA-1, SHA-256, SHA-512 generation.
            <br />• <strong>Encryption/Decryption:</strong> AES, RSA, Base64 encoding/decoding.
            <br />• <strong>Key Management:</strong> Generate and verify public/private key pairs.
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">4.2 Data Breach Monitor</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            Searchable database of leaked credentials and compromised entities. Access citizen data, password hashes, and exposure status (Leaked, Encrypted, Sold).
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">4.3 Code Editor</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            Integrated development environment (IDE) for writing and debugging scripts. Supports Python, JavaScript, and Shell scripting with syntax highlighting.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-green-400 text-lg font-bold mb-2 flex items-center gap-2 font-orbitron"><Gamepad2 size={16} /> 5.0 Entertainment Sector</h3>

        <div className="mb-4">
          <h4 className="text-white font-bold mb-1">5.1 Fun Hub</h4>
          <p className="text-sm border-l-2 border-green-900 pl-3">
            A recreational zone for downtime and creativity.
            <br />• <strong>Maze Runner:</strong> Algorithmic pathfinding game. Test your logic by solving complex mazes.
            <br />• <strong>Art Studio:</strong> New Digital creative suite.
            <br />&nbsp;&nbsp;- <strong>Layer System:</strong> Professional layer management with groups and blending modes.
            <br />&nbsp;&nbsp;- <strong>Brush Engine:</strong> Procedural brushes (Cloud, Water, Calligraphy) with customizable physics.
            <br />&nbsp;&nbsp;- <strong>Tools:</strong> Vector selection, gradient fills, and color theory tools.
          </p>
        </div>
      </section>

    </div>
  </div>
);

const AboutView = () => {
  const [realIP, setRealIP] = React.useState('Detecting...');
  const [binaryText, setBinaryText] = React.useState('');

  React.useEffect(() => {
    fetch('/api/network/myip')
      .then(res => res.json())
      .then(data => setRealIP(data.ip))
      .catch(() => setRealIP('103.14.88.2 [VPN]'));
  }, []);

  // Animated binary text
  React.useEffect(() => {
    const binaryChars = '01';
    const updateBinary = () => {
      let newText = '';
      for (let i = 0; i < 200; i++) {
        newText += binaryChars[Math.floor(Math.random() * 2)];
      }
      setBinaryText(newText);
    };

    updateBinary();
    const interval = setInterval(updateBinary, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-4 md:p-8 rounded-lg h-full overflow-y-auto border border-green-900 bg-black/40">
      {/* Header with Kali Linux Logo */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-gray-700 pb-6">
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 border-green-500 flex items-center justify-center group-hover:shadow-[0_0_30px_#00ff41] transition-all bg-black p-3 overflow-hidden relative">
            {/* Animated Binary Rain */}
            <div className="absolute inset-0 flex flex-wrap overflow-hidden opacity-60">
              {binaryText.split('').map((char, i) => (
                <span
                  key={i}
                  className="text-green-500 text-[8px] leading-none animate-pulse"
                  style={{
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: Math.random() * 0.5 + 0.3
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            {/* Center KALI text */}
            <div className="relative z-10 text-center">
              <div className="text-green-500 font-bold text-2xl tracking-wider animate-pulse">
                KALI
              </div>
              <div className="text-green-500 text-xs mt-1 font-mono">
                1101 0110
              </div>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-orbitron text-white font-bold mb-2">AI SHERLY LAB</h2>
          <p className="text-sm md:text-base text-green-400 font-mono mb-1">Kali GNU/Linux Rolling 2025.4</p>
          <p className="text-xs text-gray-500 font-mono">KERNEL: 6.16.8+kali-amd64 | ARCH: x86_64</p>
          <div className="mt-3 flex items-center justify-center md:justify-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-bold">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* System Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl">

        {/* CPU Information */}
        <div className="bg-gray-950/50 p-5 rounded-lg border border-gray-800 hover:border-green-900/50 transition-colors">
          <h4 className="text-white font-orbitron text-sm mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Cpu size={16} className="text-blue-500" />
              PROCESSOR
            </span>
            <Activity size={14} className="text-green-500 animate-pulse" />
          </h4>
          <ul className="space-y-2 font-mono text-xs">
            <li className="flex justify-between items-center">
              <span className="text-gray-500">MODEL</span>
              <span className="text-green-300 text-right ml-2">Intel Core i5-2500</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">FREQUENCY</span>
              <span className="text-green-300">3.30 GHz (Max: 3.70 GHz)</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">CORES</span>
              <span className="text-green-300">4 Cores / 4 Threads</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">ARCHITECTURE</span>
              <span className="text-green-300">Sandy Bridge (2nd Gen)</span>
            </li>
          </ul>
        </div>

        {/* GPU Information */}
        <div className="bg-gray-950/50 p-5 rounded-lg border border-gray-800 hover:border-green-900/50 transition-colors">
          <h4 className="text-white font-orbitron text-sm mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Eye size={16} className="text-purple-500" />
              GRAPHICS
            </span>
            <Activity size={14} className="text-green-500 animate-pulse" />
          </h4>
          <ul className="space-y-2 font-mono text-xs">
            <li className="flex justify-between items-center">
              <span className="text-gray-500">GPU</span>
              <span className="text-green-300 text-right ml-2">Intel HD Graphics</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">GENERATION</span>
              <span className="text-green-300">2nd Gen (Sandy Bridge)</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">TYPE</span>
              <span className="text-green-300">Integrated Graphics</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">BUS</span>
              <span className="text-green-300">PCI-E</span>
            </li>
          </ul>
        </div>

        {/* Memory Information */}
        <div className="bg-gray-950/50 p-5 rounded-lg border border-gray-800 hover:border-green-900/50 transition-colors">
          <h4 className="text-white font-orbitron text-sm mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Database size={16} className="text-yellow-500" />
              MEMORY
            </span>
            <Activity size={14} className="text-green-500 animate-pulse" />
          </h4>
          <ul className="space-y-2 font-mono text-xs">
            <li className="flex justify-between items-center">
              <span className="text-gray-500">TOTAL RAM</span>
              <span className="text-green-300">15 GiB</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">USED</span>
              <span className="text-yellow-400">9.8 GiB (65%)</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">AVAILABLE</span>
              <span className="text-green-300">5.7 GiB</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">SWAP</span>
              <span className="text-green-300">7.6 GiB (0% used)</span>
            </li>
          </ul>
        </div>

        {/* Storage Information */}
        <div className="bg-gray-950/50 p-5 rounded-lg border border-gray-800 hover:border-green-900/50 transition-colors">
          <h4 className="text-white font-orbitron text-sm mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Disc size={16} className="text-cyan-500" />
              STORAGE
            </span>
            <Activity size={14} className="text-green-500 animate-pulse" />
          </h4>
          <ul className="space-y-2 font-mono text-xs">
            <li className="flex justify-between items-center">
              <span className="text-gray-500">TOTAL CAPACITY</span>
              <span className="text-green-300">110 GB</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">USED</span>
              <span className="text-yellow-400">63 GB (61%)</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">AVAILABLE</span>
              <span className="text-green-300">42 GB</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">MOUNT POINT</span>
              <span className="text-green-300">/dev/sda7 (/root)</span>
            </li>
          </ul>
        </div>

        {/* Network Information */}
        <div className="bg-gray-950/50 p-5 rounded-lg border border-gray-800 hover:border-green-900/50 transition-colors">
          <h4 className="text-white font-orbitron text-sm mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Wifi size={16} className="text-green-500" />
              NETWORK
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-green-400">ONLINE</span>
            </div>
          </h4>
          <ul className="space-y-2 font-mono text-xs">
            <li className="flex justify-between items-center">
              <span className="text-gray-500">IP ADDRESS</span>
              <span className="text-green-300">{realIP}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">CONNECTION</span>
              <span className="text-green-300">VPN ENCRYPTED</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">STATUS</span>
              <span className="text-green-400 font-bold">SECURE</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">LATENCY</span>
              <span className="text-green-300">12ms</span>
            </li>
          </ul>
        </div>

        {/* System Information */}
        <div className="bg-gray-950/50 p-5 rounded-lg border border-gray-800 hover:border-green-900/50 transition-colors">
          <h4 className="text-white font-orbitron text-sm mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Server size={16} className="text-red-500" />
              SYSTEM
            </span>
            <Activity size={14} className="text-green-500 animate-pulse" />
          </h4>
          <ul className="space-y-2 font-mono text-xs">
            <li className="flex justify-between items-center">
              <span className="text-gray-500">OS</span>
              <span className="text-green-300">Kali Linux Rolling</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">VERSION</span>
              <span className="text-green-300">2025.4</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">KERNEL</span>
              <span className="text-green-300">6.16.8+kali-amd64</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">UPTIME</span>
              <span className="text-green-300">5 days, 12:34:21</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Application Info Footer */}
      <div className="mt-8 p-4 bg-green-900/10 border border-green-900 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="text-white font-orbitron text-sm mb-1">AI SHERLY SECURITY LAB</h4>
            <p className="text-xs text-gray-400 font-mono">Version 2.1.0 (RELEASE_PROD) | Build: 20250215</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
            <Shield size={14} className="animate-pulse" />
            <span>ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className={`glass-panel p-4 rounded-lg flex items-center justify-between border-l-4 transition-all hover:scale-[1.02] border border-green-900 bg-black/40 ${color === 'red' ? 'border-l-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
    color === 'green' ? 'border-l-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]' :
      'border-l-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
    }`}>
    <div>
      <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">{label}</p>
      <p className="text-2xl font-bold font-orbitron mt-1 text-white">{value}</p>
    </div>
    <div className="opacity-80 bg-black/40 p-2 rounded-full">{icon}</div>
  </div>
);

export default App;