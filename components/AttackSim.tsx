
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Zap, Lock, Bug, Activity, Database, Key, Terminal, 
  Server, Shield, Wifi, Search, Eye, DollarSign, Download, Cpu, 
  Camera, Trash2, Smartphone, Upload, Play, AlertTriangle 
} from 'lucide-react';
import { AttackStats } from '../types';

const AttackSim: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'network' | 'malware' | 'web'>('network');
  
  // Network Stats
  const [ddosActive, setDdosActive] = useState(false);
  const [ddosStats, setDdosStats] = useState({ rps: 0, bandwidth: 0 });
  
  // Port Scan Stats
  const [scanActive, setScanActive] = useState(false);
  const [scannedPorts, setScannedPorts] = useState<{port: number, status: 'OPEN' | 'CLOSED'}[]>([]);

  // Firewall Stats
  const [firewallLogs, setFirewallLogs] = useState<{id: string, time: string, ip: string, action: 'ALLOW' | 'BLOCK', rule: string}[]>([]);

  // Malware Stats
  const [ransomwareProgress, setRansomwareProgress] = useState(0);
  const [filesEncrypted, setFilesEncrypted] = useState(0);
  const [simProgress, setSimProgress] = useState<Record<string, number>>({});
  
  // Web Attack Stats
  const [sqliProgress, setSqliProgress] = useState(0);
  const [bruteLog, setBruteLog] = useState<string[]>([]);
  const [isBruteForcing, setIsBruteForcing] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [crackedPass, setCrackedPass] = useState<string | null>(null);

  // DDoS Simulation Effect
  useEffect(() => {
    let interval: any;
    if (ddosActive) {
      interval = setInterval(() => {
        setDdosStats(prev => ({
          rps: Math.floor(Math.random() * 50000) + 10000,
          bandwidth: Math.floor(Math.random() * 500) + 50
        }));
      }, 1000);
    } else {
      setDdosStats({ rps: 0, bandwidth: 0 });
    }
    return () => clearInterval(interval);
  }, [ddosActive]);

  // Firewall Simulation Effect
  useEffect(() => {
      const interval = setInterval(() => {
          const now = new Date().toLocaleTimeString();
          const actions = ['ALLOW', 'ALLOW', 'ALLOW', 'BLOCK', 'BLOCK'];
          const rules = ['Inbound Rule #4', 'GeoIP Filter', 'Port Security', 'Rate Limit', 'Whitelist'];
          const ips = [
              `192.168.1.${Math.floor(Math.random()*255)}`,
              `10.0.5.${Math.floor(Math.random()*255)}`,
              `172.16.0.${Math.floor(Math.random()*255)}`,
              `45.33.22.${Math.floor(Math.random()*255)}`
          ];

          const newLog = {
              id: Math.random().toString(36).substr(2, 9),
              time: now,
              ip: ips[Math.floor(Math.random() * ips.length)],
              action: actions[Math.floor(Math.random() * actions.length)] as any,
              rule: rules[Math.floor(Math.random() * rules.length)]
          };

          setFirewallLogs(prev => [newLog, ...prev].slice(0, 6));
      }, 1200);
      return () => clearInterval(interval);
  }, []);

  const startPortScan = () => {
      if (scanActive) return;
      setScanActive(true);
      setScannedPorts([]);
      const targetPorts = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 3306, 3389, 5900, 8080];
      let i = 0;

      const interval = setInterval(() => {
          if (i >= targetPorts.length) {
              setScanActive(false);
              clearInterval(interval);
              return;
          }
          const port = targetPorts[i];
          const status = Math.random() > 0.6 ? 'OPEN' : 'CLOSED';
          setScannedPorts(prev => [...prev, { port, status }]);
          i++;
      }, 150);
  };

  // Ransomware Effect
  const triggerRansomware = () => {
    setRansomwareProgress(0);
    setFilesEncrypted(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      if (p > 100) {
        clearInterval(interval);
      } else {
        setRansomwareProgress(p);
        setFilesEncrypted(prev => prev + Math.floor(Math.random() * 50));
      }
    }, 200);
  };

  // Generic Malware Simulation Trigger
  const runSimulation = (id: string) => {
    if (simProgress[id] > 0 && simProgress[id] < 100) return; // Already running
    
    setSimProgress(prev => ({...prev, [id]: 1})); // Start
    
    let p = 0;
    const interval = setInterval(() => {
        p += Math.floor(Math.random() * 5) + 2;
        if (p >= 100) {
            p = 100;
            setSimProgress(prev => ({...prev, [id]: 100}));
            clearInterval(interval);
        } else {
            setSimProgress(prev => ({...prev, [id]: p}));
        }
    }, 100);
  };

  // Brute Force Effect
  const startBruteForce = () => {
      setIsBruteForcing(true);
      setCrackedPass(null);
      setBruteLog([]);
      setHashRate(0);
      
      const targetHash = "5f4dcc3b5aa765d61d8327deb882cf99"; // password123
      let attempts = 0;
      
      const interval = setInterval(() => {
          attempts++;
          setHashRate(Math.floor(Math.random() * 5000) + 10000);
          
          if (attempts > 30) {
              clearInterval(interval);
              setIsBruteForcing(false);
              setCrackedPass("password123");
              setHashRate(0);
          } else {
              const attempt = Math.random().toString(36).substr(2, 8);
              setBruteLog(prev => [`[${new Date().toLocaleTimeString()}] Trying: ${attempt} (Hash: ${Math.random().toString(16).substr(2, 32)})... REJECTED`, ...prev].slice(0, 12));
          }
      }, 100);
  };

  // List of 10 Extra Malware Simulations
  const malwareList = [
    { id: 'zeus', name: 'Zeus Trojan', desc: 'Banking Credential Harvester', icon: <DollarSign size={18} />, color: 'text-green-400', border: 'border-green-500' },
    { id: 'emotet', name: 'Emotet', desc: 'Polymorphic Downloader', icon: <Download size={18} />, color: 'text-blue-400', border: 'border-blue-500' },
    { id: 'stuxnet', name: 'Stuxnet', desc: 'SCADA/PLC Sabotage', icon: <Activity size={18} />, color: 'text-orange-400', border: 'border-orange-500' },
    { id: 'tesla', name: 'Agent Tesla', desc: 'Keylogger & Spyware', icon: <Eye size={18} />, color: 'text-purple-400', border: 'border-purple-500' },
    { id: 'mirai', name: 'Mirai', desc: 'IoT Botnet Recruitment', icon: <Wifi size={18} />, color: 'text-red-400', border: 'border-red-500' },
    { id: 'xmrig', name: 'XMRig', desc: 'Cryptojacking Miner', icon: <Cpu size={18} />, color: 'text-yellow-400', border: 'border-yellow-500' },
    { id: 'darkcomet', name: 'DarkComet', desc: 'Remote Administration Tool', icon: <Camera size={18} />, color: 'text-pink-400', border: 'border-pink-500' },
    { id: 'shamoon', name: 'Shamoon', desc: 'Disk Wiper', icon: <Trash2 size={18} />, color: 'text-gray-400', border: 'border-gray-500' },
    { id: 'pegasus', name: 'Pegasus', desc: 'Zero-click Mobile Spyware', icon: <Smartphone size={18} />, color: 'text-cyan-400', border: 'border-cyan-500' },
    { id: 'clop', name: 'Clop', desc: 'Data Exfiltration', icon: <Upload size={18} />, color: 'text-indigo-400', border: 'border-indigo-500' },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Sub Nav */}
      <div className="flex gap-2 border-b border-green-900 pb-2">
          <button onClick={() => setActiveTab('network')} className={`px-4 py-2 text-sm font-bold rounded ${activeTab === 'network' ? 'bg-red-900/30 text-red-400 border border-red-500' : 'text-gray-500 hover:text-gray-300'}`}>Network Attacks</button>
          <button onClick={() => setActiveTab('malware')} className={`px-4 py-2 text-sm font-bold rounded ${activeTab === 'malware' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}>Malware</button>
          <button onClick={() => setActiveTab('web')} className={`px-4 py-2 text-sm font-bold rounded ${activeTab === 'web' ? 'bg-blue-900/30 text-blue-400 border border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>Web Exploits</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        
        {/* NETWORK TAB */}
        {activeTab === 'network' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. DDoS Panel */}
                <div className="glass-panel p-6 rounded-lg relative overflow-hidden group border border-red-900 bg-black/40">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-orbitron text-red-400 flex items-center gap-2">
                                    <Zap size={20} /> DDoS Flood
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">UDP/TCP Packet Storm</p>
                            </div>
                            <button 
                                onClick={() => setDdosActive(!ddosActive)}
                                className={`px-4 py-2 rounded font-bold transition-all ${ddosActive ? 'bg-red-500 text-black animate-pulse' : 'bg-transparent border border-red-500 text-red-400 hover:bg-red-900/30'}`}
                            >
                                {ddosActive ? 'STOP' : 'ATTACK'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-black p-3 rounded border border-red-900/30">
                                <div className="text-xs text-red-300">Requests/Sec</div>
                                <div className="text-2xl font-mono text-red-500">{ddosStats.rps.toLocaleString()}</div>
                            </div>
                            <div className="bg-black p-3 rounded border border-red-900/30">
                                <div className="text-xs text-red-300">Bandwidth (MB/s)</div>
                                <div className="text-2xl font-mono text-red-500">{ddosStats.bandwidth}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Port Scanner Panel */}
                <div className="glass-panel p-6 rounded-lg border border-orange-900 bg-black/40">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-orbitron text-orange-400 flex items-center gap-2">
                                <Search size={20} /> Port Scanner
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Target: 192.168.1.50</p>
                        </div>
                        <button 
                            onClick={startPortScan}
                            disabled={scanActive}
                            className="px-4 py-2 bg-orange-900/20 border border-orange-500 text-orange-400 rounded font-bold hover:bg-orange-900/40 disabled:opacity-50"
                        >
                            {scanActive ? 'SCANNING...' : 'START SCAN'}
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        {scannedPorts.map((p, i) => (
                            <div key={i} className={`p-2 rounded text-center border text-xs font-mono font-bold ${p.status === 'OPEN' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400 opacity-50'}`}>
                                <div>{p.port}</div>
                                <div>{p.status}</div>
                            </div>
                        ))}
                        {scannedPorts.length === 0 && !scanActive && (
                            <div className="col-span-4 text-center text-gray-600 text-xs py-4">
                                Ready to initialize reconnaissance scan...
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Firewall/IDS Panel */}
                <div className="glass-panel p-6 rounded-lg border border-blue-900 bg-black/40">
                    <h3 className="text-xl font-orbitron text-blue-400 flex items-center gap-2 mb-4">
                        <Shield size={20} /> IDS Firewall Log
                    </h3>
                    <div className="space-y-2 font-mono text-xs max-h-40 overflow-y-auto">
                        <div className="grid grid-cols-4 text-gray-500 border-b border-gray-700 pb-1 mb-1">
                            <span>TIME</span>
                            <span>SOURCE IP</span>
                            <span>ACTION</span>
                            <span>RULE</span>
                        </div>
                        {firewallLogs.map((log) => (
                            <div key={log.id} className="grid grid-cols-4 items-center">
                                <span className="text-gray-500">{log.time}</span>
                                <span className="text-gray-300">{log.ip}</span>
                                <span className={log.action === 'BLOCK' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{log.action}</span>
                                <span className="text-gray-400 truncate">{log.rule}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Traffic Analyzer / Sniffer */}
                <div className="glass-panel p-6 rounded-lg border border-purple-900 bg-black/40">
                    <h3 className="text-xl font-orbitron text-purple-400 flex items-center gap-2 mb-4">
                        <Activity size={20} /> Packet Sniffer
                    </h3>
                    <div className="bg-black p-3 rounded h-40 overflow-hidden font-mono text-[10px] text-gray-500 border border-gray-800 relative">
                        <div className="absolute top-0 right-0 p-2 text-purple-500 animate-pulse">
                            <Wifi size={14} />
                        </div>
                        {Array.from({length: 8}).map((_, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="text-purple-500/50">0x{Math.floor(Math.random()*9999).toString(16).padStart(4,'0')}:</span>
                                <span className="text-gray-400">
                                    {Math.random().toString(16).substr(2, 24).match(/.{1,2}/g)?.join(' ')} 
                                </span>
                                <span className="text-gray-600 border-l border-gray-800 pl-2 truncate">
                                    {['GET / HTTP/1.1', 'SSH-2.0-OpenSSH', 'TLSv1.3 Client Hello', 'ACK [SYN] Seq=0'][Math.floor(Math.random()*4)]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* MALWARE TAB */}
        {activeTab === 'malware' && (
             <div className="space-y-4">
                 {/* Existing Ransomware (WannaCry) */}
                 <div className="glass-panel p-6 rounded-lg relative overflow-hidden group border border-yellow-900 bg-black/40">
                     <div className="relative z-10">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                           <h3 className="text-xl font-orbitron text-yellow-400 flex items-center gap-2">
                             <Lock size={20} /> Ransomware
                           </h3>
                           <p className="text-sm text-gray-400 mt-1">WannaCry Simulation</p>
                         </div>
                         <button 
                           onClick={triggerRansomware}
                           disabled={ransomwareProgress > 0 && ransomwareProgress < 100}
                           className="px-4 py-2 bg-transparent border border-yellow-500 text-yellow-400 hover:bg-yellow-900/30 rounded font-bold disabled:opacity-50"
                         >
                           DEPLOY
                         </button>
                       </div>
             
                       <div className="mt-6 space-y-2">
                         <div className="flex justify-between text-xs text-yellow-300">
                           <span>Encryption Progress</span>
                           <span>{ransomwareProgress}%</span>
                         </div>
                         <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-yellow-900/30">
                           <div 
                             className="h-full bg-yellow-500 transition-all duration-200"
                             style={{ width: `${ransomwareProgress}%` }}
                           ></div>
                         </div>
                         <div className="text-center mt-4">
                           <span className="text-3xl font-mono text-yellow-500">{filesEncrypted}</span>
                           <span className="text-xs text-gray-400 ml-2">FILES LOCKED</span>
                         </div>
                       </div>
                     </div>
                 </div>

                 {/* New Simulations Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                     {malwareList.map((m) => (
                         <div key={m.id} className={`glass-panel p-4 rounded-lg border bg-black/40 flex flex-col justify-between ${m.border} border-opacity-30`}>
                             <div className="flex justify-between items-start mb-2">
                                 <div className="flex items-center gap-3">
                                     <div className={`p-2 rounded-full bg-gray-900 border ${m.border} ${m.color}`}>
                                         {m.icon}
                                     </div>
                                     <div>
                                         <h4 className={`font-orbitron font-bold text-sm ${m.color}`}>{m.name}</h4>
                                         <p className="text-[10px] text-gray-500">{m.desc}</p>
                                     </div>
                                 </div>
                                 <button 
                                     onClick={() => runSimulation(m.id)}
                                     disabled={simProgress[m.id] > 0 && simProgress[m.id] < 100}
                                     className={`p-1.5 rounded transition-colors ${
                                         simProgress[m.id] === 100 
                                         ? 'bg-green-900/50 text-green-500' 
                                         : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                                     }`}
                                 >
                                     {simProgress[m.id] === 100 ? <Activity size={16}/> : <Play size={16} />}
                                 </button>
                             </div>
                             
                             {/* Progress Bar */}
                             <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-3">
                                 <div 
                                     className={`h-full transition-all duration-200 ${m.color.replace('text-', 'bg-')}`} 
                                     style={{ width: `${simProgress[m.id] || 0}%` }}
                                 ></div>
                             </div>
                             <div className="flex justify-between mt-1 text-[10px] font-mono text-gray-600">
                                 <span>{simProgress[m.id] > 0 && simProgress[m.id] < 100 ? 'EXECUTING...' : simProgress[m.id] === 100 ? 'COMPLETED' : 'READY'}</span>
                                 <span>{simProgress[m.id] || 0}%</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        )}

        {/* WEB EXPLOITS TAB */}
        {activeTab === 'web' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SQL Injection */}
                <div className="glass-panel p-6 rounded-lg border border-blue-900 bg-black/40">
                    <h3 className="text-xl font-orbitron text-blue-400 flex items-center gap-2 mb-2">
                        <Database size={20} /> SQL Injection
                    </h3>
                    <div className="bg-black p-3 rounded border border-blue-900 font-mono text-xs text-gray-300 mb-2">
                        SELECT * FROM users WHERE username = '<span className="text-red-500">admin' --</span>' AND password = '...'
                    </div>
                    <button onClick={() => setSqliProgress(100)} className="w-full py-2 bg-blue-600/20 border border-blue-500 text-blue-400 rounded hover:bg-blue-600/40">
                        INJECT PAYLOAD
                    </button>
                    {sqliProgress > 0 && (
                        <div className="mt-2 p-2 bg-green-900/20 text-green-400 text-xs border border-green-500 rounded">
                            [+] Successfully bypassed authentication. Logged in as ADMIN.
                        </div>
                    )}
                </div>

                {/* Real Brute Force Visualization */}
                <div className="glass-panel p-4 rounded-lg border border-blue-900 bg-black/40 col-span-1 md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-orbitron text-blue-400 flex items-center gap-2">
                            <Key size={20} /> Hashcat Simulation
                        </h3>
                        <button 
                            onClick={startBruteForce} 
                            disabled={isBruteForcing || crackedPass !== null}
                            className="px-4 py-2 bg-blue-900/30 border border-blue-500 text-blue-400 rounded hover:bg-blue-800 disabled:opacity-50"
                        >
                            {isBruteForcing ? 'CRACKING...' : crackedPass ? 'CRACKED' : 'START ATTACK'}
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Panel */}
                        <div className="bg-gray-900 p-3 rounded font-mono text-xs text-gray-400 space-y-2 border border-gray-700">
                            <div className="flex justify-between">
                                <span>Target:</span>
                                <span className="text-white">5f4dcc3b5aa765d61d8327deb882cf99</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Hash Type:</span>
                                <span className="text-yellow-400">MD5</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Speed:</span>
                                <span className="text-blue-400">{hashRate} H/s</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={isBruteForcing ? "text-yellow-500 animate-pulse" : crackedPass ? "text-green-500" : "text-gray-500"}>
                                    {isBruteForcing ? "RUNNING" : crackedPass ? "EXHAUSTED" : "IDLE"}
                                </span>
                            </div>
                            {crackedPass && (
                                <div className="mt-4 p-2 bg-green-900/20 border border-green-500 text-green-400 text-center text-lg font-bold animate-pulse">
                                    {crackedPass}
                                </div>
                            )}
                        </div>

                        {/* Terminal Log */}
                        <div className="bg-black p-3 rounded h-40 overflow-hidden font-mono text-[10px] text-gray-500 border border-gray-800 relative">
                            <div className="absolute top-0 right-0 p-1">
                                <Terminal size={12} />
                            </div>
                            {bruteLog.map((l, i) => (
                                <div key={i} className="truncate">{l}</div>
                            ))}
                            {isBruteForcing && <div className="animate-pulse">_</div>}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AttackSim;
