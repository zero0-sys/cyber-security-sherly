
import React, { useState, useEffect, useRef } from 'react';
import {
    ShieldAlert, Zap, Lock, Bug, Activity, Database, Key, Terminal,
    Server, Shield, Wifi, Search, Eye, DollarSign, Download, Cpu,
    Camera, Trash2, Smartphone, Upload, Play, AlertTriangle, Send,
    RefreshCw, Target, Globe, Code, CheckCircle, FileText, GitCompare,
    BarChart3, Binary, Shuffle, Crosshair, Loader2, Clock
} from 'lucide-react';
import { AttackStats } from '../types';

const AttackSim: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'network' | 'malware' | 'web' | 'burp'>('network');

    // Network Stats
    const [ddosActive, setDdosActive] = useState(false);
    const [ddosStats, setDdosStats] = useState({ rps: 0, bandwidth: 0 });

    // Port Scan Stats
    const [scanActive, setScanActive] = useState(false);
    const [scannedPorts, setScannedPorts] = useState<{ port: number, status: 'OPEN' | 'CLOSED' }[]>([]);

    // Firewall Stats
    const [firewallLogs, setFirewallLogs] = useState<{ id: string, time: string, ip: string, action: 'ALLOW' | 'BLOCK', rule: string }[]>([]);

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

    // Burp Suite Stats
    const [httpHistory, setHttpHistory] = useState<{ id: string, method: string, url: string, status: number, time: string }[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [interceptEnabled, setInterceptEnabled] = useState(false);
    const [targetUrl, setTargetUrl] = useState('https://api.example.com/login');
    const [requestBody, setRequestBody] = useState('{"username":"admin","password":"test123"}');
    const [intruderRunning, setIntruderRunning] = useState(false);
    const [intruderResults, setIntruderResults] = useState<{ payload: string, status: number, length: number }[]>([]);
    const [scanResults, setScanResults] = useState<{ type: string, severity: 'high' | 'medium' | 'low', finding: string }[]>([]);

    // SQL Injection Tester
    const [sqlTestUrl, setSqlTestUrl] = useState('https://vulnerable-site.com/product.php?id=1');
    const [sqlPayloads, setSqlPayloads] = useState<{ payload: string, type: string, result: string, vulnerable: boolean }[]>([]);
    const [sqlTestRunning, setSqlTestRunning] = useState(false);

    // Decoder
    const [decoderInput, setDecoderInput] = useState('');
    const [decoderOutput, setDecoderOutput] = useState('');
    const [decoderMode, setDecoderMode] = useState<'encode' | 'decode'>('decode');
    const [decoderType, setDecoderType] = useState<'base64' | 'url' | 'html' | 'hex'>('base64');

    // Comparer
    const [compareLeft, setCompareLeft] = useState('');
    const [compareRight, setCompareRight] = useState('');
    const [compareDiff, setCompareDiff] = useState<{ type: 'add' | 'remove' | 'same', line: string }[]>([]);

    // Sequencer
    const [tokenSamples, setTokenSamples] = useState<string[]>([]);
    const [entropyScore, setEntropyScore] = useState(0);
    const [sequencerRunning, setSequencerRunning] = useState(false);

    // Advanced Brute Force Attack
    const [bruteForceTarget, setBruteForceTarget] = useState('https://example.com/api/login');
    const [bruteForceUsername, setBruteForceUsername] = useState('admin');
    const [bruteForceMethod, setBruteForceMethod] = useState<'POST' | 'GET'>('POST');
    const [bruteForceRunning, setBruteForceRunning] = useState(false);
    const [bruteForceProgress, setBruteForceProgress] = useState(0);
    const [bruteForceAttempts, setBruteForceAttempts] = useState(0);
    const [bruteForceSuccess, setBruteForceSuccess] = useState<{ username: string, password: string } | null>(null);
    const [bruteForceLog, setBruteForceLog] = useState<{ time: string, username: string, password: string, status: number, success: boolean }[]>([]);
    const [bruteForceSpeed, setBruteForceSpeed] = useState(50); // attempts per second
    const [passwordWordlist, setPasswordWordlist] = useState<string[]>([]);

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
                `192.168.1.${Math.floor(Math.random() * 255)}`,
                `10.0.5.${Math.floor(Math.random() * 255)}`,
                `172.16.0.${Math.floor(Math.random() * 255)}`,
                `45.33.22.${Math.floor(Math.random() * 255)}`
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

    // Load password wordlist on component mount
    useEffect(() => {
        const loadWordlist = async () => {
            try {
                const response = await fetch('/wordlists/passwords.txt');
                const text = await response.text();
                const passwords = text.split('\n').filter(p => p.trim().length > 0);
                setPasswordWordlist(passwords);
                console.log(`✓ Loaded ${passwords.length} passwords for brute force`);
            } catch (error) {
                console.error('Failed to load password wordlist:', error);
                // Fallback to basic wordlist
                setPasswordWordlist(['123456', 'password', 'admin', 'root', 'test', 'guest']);
            }
        };
        loadWordlist();
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

        setSimProgress(prev => ({ ...prev, [id]: 1 })); // Start

        let p = 0;
        const interval = setInterval(() => {
            p += Math.floor(Math.random() * 5) + 2;
            if (p >= 100) {
                p = 100;
                setSimProgress(prev => ({ ...prev, [id]: 100 }));
                clearInterval(interval);
            } else {
                setSimProgress(prev => ({ ...prev, [id]: p }));
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
                <button onClick={() => setActiveTab('burp')} className={`px-4 py-2 text-sm font-bold rounded ${activeTab === 'burp' ? 'bg-orange-900/30 text-orange-400 border border-orange-500' : 'text-gray-500 hover:text-gray-300'}`}>Burp Suite</button>
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
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-purple-500/50">0x{Math.floor(Math.random() * 9999).toString(16).padStart(4, '0')}:</span>
                                        <span className="text-gray-400">
                                            {Math.random().toString(16).substr(2, 24).match(/.{1,2}/g)?.join(' ')}
                                        </span>
                                        <span className="text-gray-600 border-l border-gray-800 pl-2 truncate">
                                            {['GET / HTTP/1.1', 'SSH-2.0-OpenSSH', 'TLSv1.3 Client Hello', 'ACK [SYN] Seq=0'][Math.floor(Math.random() * 4)]}
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
                                            className={`p-1.5 rounded transition-colors ${simProgress[m.id] === 100
                                                ? 'bg-green-900/50 text-green-500'
                                                : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                                                }`}
                                        >
                                            {simProgress[m.id] === 100 ? <CheckCircle size={16} /> : <Play size={16} />}
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

                {/* BURP SUITE TAB */}
                {activeTab === 'burp' && (
                    <div className="space-y-4">
                        {/* HTTP Proxy & Interceptor */}
                        <div className="glass-panel p-6 rounded-lg border border-orange-900 bg-black/40">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-orbitron text-orange-400 flex items-center gap-2">
                                    <Globe size={20} /> HTTP Proxy
                                </h3>
                                <button
                                    onClick={() => {
                                        setInterceptEnabled(!interceptEnabled);
                                        if (!interceptEnabled) { // If enabling, simulate some requests
                                            const newReq1 = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                method: 'GET',
                                                url: 'https://api.example.com/data',
                                                status: 200,
                                                time: new Date().toLocaleTimeString()
                                            };
                                            const newReq2 = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                method: 'POST',
                                                url: 'https://api.example.com/login',
                                                status: 401,
                                                time: new Date().toLocaleTimeString()
                                            };
                                            setHttpHistory(prev => [newReq2, newReq1, ...prev]);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded font-bold transition-all ${interceptEnabled
                                        ? 'bg-orange-500 text-black animate-pulse'
                                        : 'bg-transparent border border-orange-500 text-orange-400 hover:bg-orange-900/30'
                                        }`}
                                >
                                    {interceptEnabled ? 'INTERCEPT ON' : 'INTERCEPT OFF'}
                                </button>
                            </div>
                            <div className="text-xs text-gray-400 mb-2">Listening on: 127.0.0.1:8080</div>
                            <div className="bg-black p-3 rounded border border-orange-900 font-mono text-xs text-gray-300 space-y-1">
                                <div className="flex gap-4 text-gray-500 border-b border-gray-800 pb-1 mb-2">
                                    <span className="w-16">Method</span>
                                    <span className="flex-1">URL</span>
                                    <span className="w-12">Status</span>
                                    <span className="w-16">Time</span>
                                </div>
                                {httpHistory.length === 0 ? (
                                    <div className="text-center text-gray-600 py-4">No requests intercepted yet...</div>
                                ) : (
                                    httpHistory.slice(0, 5).map((req) => (
                                        <div key={req.id} className="flex gap-4 items-center hover:bg-gray-900/30 cursor-pointer" onClick={() => setSelectedRequest(req.id)}>
                                            <span className={`w-16 font-bold ${req.method === 'POST' ? 'text-yellow-500' : 'text-blue-400'}`}>{req.method}</span>
                                            <span className="flex-1 truncate text-gray-400">{req.url}</span>
                                            <span className={`w-12 ${req.status === 200 ? 'text-green-500' : 'text-red-500'}`}>{req.status}</span>
                                            <span className="w-16 text-gray-600">{req.time}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Repeater Module */}
                        <div className="glass-panel p-6 rounded-lg border border-purple-900 bg-black/40">
                            <h3 className="text-xl font-orbitron text-purple-400 flex items-center gap-2 mb-4">
                                <RefreshCw size={20} /> Repeater
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Target URL</label>
                                    <input
                                        type="text"
                                        value={targetUrl}
                                        onChange={(e) => setTargetUrl(e.target.value)}
                                        className="w-full bg-black border border-purple-900 rounded px-3 py-2 text-sm text-gray-300 font-mono"
                                        placeholder="https://target.com/api/endpoint"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Request Body (JSON)</label>
                                    <textarea
                                        value={requestBody}
                                        onChange={(e) => setRequestBody(e.target.value)}
                                        className="w-full bg-black border border-purple-900 rounded px-3 py-2 text-sm text-gray-300 font-mono h-24"
                                        placeholder='{"key": "value"}'
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const newReq = {
                                            id: Math.random().toString(36).substr(2, 9),
                                            method: 'POST',
                                            url: targetUrl,
                                            status: Math.random() > 0.5 ? 200 : 401,
                                            time: new Date().toLocaleTimeString()
                                        };
                                        setHttpHistory(prev => [newReq, ...prev]);
                                    }}
                                    className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500 text-purple-400 rounded font-bold hover:bg-purple-900/50 flex items-center justify-center gap-2"
                                >
                                    <Send size={16} /> Send Request
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Intruder Module */}
                            <div className="glass-panel p-6 rounded-lg border border-red-900 bg-black/40">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-orbitron text-red-400 flex items-center gap-2">
                                        <Target size={20} /> Intruder
                                    </h3>
                                    <button
                                        onClick={() => {
                                            if (intruderRunning) return;
                                            setIntruderRunning(true);
                                            setIntruderResults([]);
                                            const payloads = ['admin', 'root', 'test', 'user', 'password', '12345', 'admin123'];
                                            let i = 0;
                                            const interval = setInterval(() => {
                                                if (i >= payloads.length) {
                                                    setIntruderRunning(false);
                                                    clearInterval(interval);
                                                    return;
                                                }
                                                setIntruderResults(prev => [...prev, {
                                                    payload: payloads[i],
                                                    status: Math.random() > 0.9 ? 200 : 401,
                                                    length: Math.floor(Math.random() * 500) + 100
                                                }]);
                                                i++;
                                            }, 300);
                                        }}
                                        disabled={intruderRunning}
                                        className="px-4 py-2 bg-red-900/30 border border-red-500 text-red-400 rounded font-bold hover:bg-red-900/50 disabled:opacity-50"
                                    >
                                        {intruderRunning ? 'ATTACKING...' : 'START ATTACK'}
                                    </button>
                                </div>
                                <div className="bg-black p-3 rounded border border-red-900 font-mono text-xs max-h-40 overflow-y-auto">
                                    {intruderResults.length === 0 ? (
                                        <div className="text-center text-gray-600 py-4">Ready to launch payload attack...</div>
                                    ) : (
                                        intruderResults.map((r, i) => (
                                            <div key={i} className="flex justify-between items-center py-1">
                                                <span className="text-gray-400">{r.payload}</span>
                                                <span className={r.status === 200 ? 'text-green-500 font-bold' : 'text-gray-600'}>
                                                    {r.status} ({r.length}b)
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Scanner Module */}
                            <div className="glass-panel p-6 rounded-lg border border-cyan-900 bg-black/40">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-orbitron text-cyan-400 flex items-center gap-2">
                                        <Search size={20} /> Scanner
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setScanResults([
                                                { type: 'SQL Injection', severity: 'high', finding: 'Parameter "id" vulnerable to SQLi' },
                                                { type: 'XSS', severity: 'medium', finding: 'Reflected XSS in search field' },
                                                { type: 'CSRF', severity: 'medium', finding: 'Missing CSRF token' },
                                                { type: 'Open Redirect', severity: 'low', finding: 'Unvalidated redirect parameter' }
                                            ]);
                                        }}
                                        className="px-4 py-2 bg-cyan-900/30 border border-cyan-500 text-cyan-400 rounded font-bold hover:bg-cyan-900/50"
                                    >
                                        SCAN
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {scanResults.length === 0 ? (
                                        <div className="bg-black p-3 rounded border border-cyan-900 text-center text-gray-600 text-xs py-4">
                                            No vulnerabilities detected yet...
                                        </div>
                                    ) : (
                                        scanResults.map((s, i) => (
                                            <div key={i} className={`p-3 rounded border text-xs ${s.severity === 'high' ? 'bg-red-900/20 border-red-500 text-red-400' :
                                                s.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-400' :
                                                    'bg-blue-900/20 border-blue-500 text-blue-400'
                                                }`}>
                                                <div className="font-bold flex items-center gap-2">
                                                    <AlertTriangle size={14} />
                                                    {s.type} [{s.severity.toUpperCase()}]
                                                </div>
                                                <div className="text-gray-400 mt-1">{s.finding}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Request/Response Viewer */}
                        {selectedRequest && (
                            <div className="glass-panel p-6 rounded-lg border border-green-900 bg-black/40">
                                <h3 className="text-xl font-orbitron text-green-400 flex items-center gap-2 mb-4">
                                    <Code size={20} /> Request Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-2">Request</div>
                                        <div className="bg-black p-3 rounded border border-green-900 font-mono text-xs text-gray-300 h-48 overflow-auto">
                                            POST /api/login HTTP/1.1{"\n"}
                                            Host: api.example.com{"\n"}
                                            Content-Type: application/json{"\n"}
                                            Content-Length: 45{"\n"}
                                            {"\n"}
                                            {requestBody}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-2">Response</div>
                                        <div className="bg-black p-3 rounded border border-green-900 font-mono text-xs text-gray-300 h-48 overflow-auto">
                                            HTTP/1.1 200 OK{"\n"}
                                            Content-Type: application/json{"\n"}
                                            {"\n"}
                                            {'{'}
                                            "success": true,{"\n"}
                                            "token": "eyJhbGciOiJIUzI1NiIs...",{"\n"}
                                            "user": "admin"{"\n"}
                                            {'}'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SQL Injection Tester */}
                        <div className="glass-panel p-6 rounded-lg border border-red-900 bg-black/40">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-orbitron text-red-400 flex items-center gap-2">
                                    <Database size={20} /> SQL Injection Tester
                                </h3>
                                <button
                                    onClick={() => {
                                        if (sqlTestRunning) return;
                                        setSqlTestRunning(true);
                                        setSqlPayloads([]);

                                        const testPayloads = [
                                            { payload: "' OR '1'='1", type: 'Boolean-based', result: 'Syntax error detected', vulnerable: true },
                                            { payload: "' UNION SELECT NULL--", type: 'UNION-based', result: 'Column count mismatch', vulnerable: false },
                                            { payload: "' AND 1=1--", type: 'Boolean-based', result: 'Response identical', vulnerable: true },
                                            { payload: "' AND SLEEP(5)--", type: 'Time-based', result: 'Delay detected: 5.2s', vulnerable: true },
                                            { payload: "admin'--", type: 'Comment injection', result: 'Auth bypassed', vulnerable: true },
                                            { payload: "1' ORDER BY 10--", type: 'Column enumeration', result: 'Unknown column', vulnerable: false },
                                            { payload: "' UNION SELECT username,password FROM users--", type: 'Data extraction', result: 'Database error', vulnerable: true },
                                            { payload: "'; DROP TABLE users--", type: 'Stacked queries', result: 'Query executed!', vulnerable: true }
                                        ];

                                        let i = 0;
                                        const interval = setInterval(() => {
                                            if (i >= testPayloads.length) {
                                                setSqlTestRunning(false);
                                                clearInterval(interval);
                                                return;
                                            }
                                            setSqlPayloads(prev => [...prev, testPayloads[i]]);
                                            i++;
                                        }, 400);
                                    }}
                                    disabled={sqlTestRunning}
                                    className="px-4 py-2 bg-red-900/30 border border-red-500 text-red-400 rounded font-bold hover:bg-red-900/50 disabled:opacity-50"
                                >
                                    {sqlTestRunning ? 'TESTING...' : 'RUN SQL TEST'}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Target URL</label>
                                    <input
                                        type="text"
                                        value={sqlTestUrl}
                                        onChange={(e) => setSqlTestUrl(e.target.value)}
                                        className="w-full bg-black border border-red-900 rounded px-3 py-2 text-sm text-gray-300 font-mono"
                                        placeholder="https://target.com/page.php?id=1"
                                    />
                                </div>
                                <div className="bg-black p-3 rounded border border-red-900 max-h-64 overflow-y-auto">
                                    {sqlPayloads.length === 0 ? (
                                        <div className="text-center text-gray-600 text-xs py-4">No payloads tested yet...</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {sqlPayloads.map((p, i) => (
                                                <div key={i} className={`p-2 rounded border text-xs ${p.vulnerable ? 'bg-red-900/20 border-red-500' : 'bg-gray-900/20 border-gray-700'}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-gray-400 font-mono">{p.payload}</span>
                                                        {p.vulnerable && <span className="text-red-500 font-bold">VULNERABLE!</span>}
                                                    </div>
                                                    <div className="text-gray-500">Type: {p.type}</div>
                                                    <div className={p.vulnerable ? 'text-red-400' : 'text-gray-600'}>Result: {p.result}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Decoder Module */}
                        <div className="glass-panel p-6 rounded-lg border border-blue-900 bg-black/40">
                            <h3 className="text-xl font-orbitron text-blue-400 flex items-center gap-2 mb-4">
                                <Binary size={20} /> Decoder
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <select
                                        value={decoderType}
                                        onChange={(e) => setDecoderType(e.target.value as any)}
                                        className="bg-black border border-blue-900 rounded px-3 py-2 text-sm text-gray-300"
                                    >
                                        <option value="base64">Base64</option>
                                        <option value="url">URL Encode</option>
                                        <option value="html">HTML Entities</option>
                                        <option value="hex">Hex</option>
                                    </select>
                                    <select
                                        value={decoderMode}
                                        onChange={(e) => setDecoderMode(e.target.value as any)}
                                        className="bg-black border border-blue-900 rounded px-3 py-2 text-sm text-gray-300"
                                    >
                                        <option value="decode">Decode</option>
                                        <option value="encode">Encode</option>
                                    </select>
                                    <button
                                        onClick={() => {
                                            let output = decoderInput;
                                            try {
                                                if (decoderType === 'base64') {
                                                    output = decoderMode === 'decode'
                                                        ? atob(decoderInput)
                                                        : btoa(decoderInput);
                                                } else if (decoderType === 'url') {
                                                    output = decoderMode === 'decode'
                                                        ? decodeURIComponent(decoderInput)
                                                        : encodeURIComponent(decoderInput);
                                                } else if (decoderType === 'html') {
                                                    output = decoderMode === 'decode'
                                                        ? decoderInput.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
                                                        : decoderInput.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                                } else if (decoderType === 'hex') {
                                                    output = decoderMode === 'decode'
                                                        ? decoderInput.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || ''
                                                        : decoderInput.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
                                                }
                                                setDecoderOutput(output);
                                            } catch (e) {
                                                setDecoderOutput('Error: Invalid input');
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-900/30 border border-blue-500 text-blue-400 rounded font-bold hover:bg-blue-900/50"
                                    >
                                        {decoderMode === 'decode' ? 'DECODE' : 'ENCODE'}
                                    </button>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Input</label>
                                    <textarea
                                        value={decoderInput}
                                        onChange={(e) => setDecoderInput(e.target.value)}
                                        className="w-full bg-black border border-blue-900 rounded px-3 py-2 text-sm text-gray-300 font-mono h-20"
                                        placeholder="Enter text to encode/decode..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Output</label>
                                    <div className="bg-black border border-blue-900 rounded px-3 py-2 text-sm text-green-400 font-mono h-20 overflow-auto">
                                        {decoderOutput || 'Output will appear here...'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Comparer Module */}
                            <div className="glass-panel p-6 rounded-lg border border-purple-900 bg-black/40">
                                <h3 className="text-xl font-orbitron text-purple-400 flex items-center gap-2 mb-4">
                                    <GitCompare size={20} /> Comparer
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Request/Response A</label>
                                        <textarea
                                            value={compareLeft}
                                            onChange={(e) => setCompareLeft(e.target.value)}
                                            className="w-full bg-black border border-purple-900 rounded px-2 py-2 text-xs text-gray-300 font-mono h-24"
                                            placeholder="Paste first response..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Request/Response B</label>
                                        <textarea
                                            value={compareRight}
                                            onChange={(e) => setCompareRight(e.target.value)}
                                            className="w-full bg-black border border-purple-900 rounded px-2 py-2 text-xs text-gray-300 font-mono h-24"
                                            placeholder="Paste second response..."
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const leftLines = compareLeft.split('\n');
                                            const rightLines = compareRight.split('\n');
                                            const diff: any[] = [];
                                            const maxLen = Math.max(leftLines.length, rightLines.length);

                                            for (let i = 0; i < maxLen; i++) {
                                                if (leftLines[i] === rightLines[i]) {
                                                    diff.push({ type: 'same', line: leftLines[i] || '' });
                                                } else if (!rightLines[i]) {
                                                    diff.push({ type: 'remove', line: leftLines[i] });
                                                } else if (!leftLines[i]) {
                                                    diff.push({ type: 'add', line: rightLines[i] });
                                                } else {
                                                    diff.push({ type: 'remove', line: leftLines[i] });
                                                    diff.push({ type: 'add', line: rightLines[i] });
                                                }
                                            }
                                            setCompareDiff(diff);
                                        }}
                                        className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500 text-purple-400 rounded font-bold hover:bg-purple-900/50"
                                    >
                                        COMPARE
                                    </button>
                                    {compareDiff.length > 0 && (
                                        <div className="bg-black border border-purple-900 rounded p-2 max-h-48 overflow-auto">
                                            {compareDiff.map((d, i) => (
                                                <div key={i} className={`text-xs font-mono ${d.type === 'add' ? 'text-green-500 bg-green-900/20' :
                                                    d.type === 'remove' ? 'text-red-500 bg-red-900/20' :
                                                        'text-gray-500'
                                                    }`}>
                                                    {d.type === 'add' ? '+ ' : d.type === 'remove' ? '- ' : '  '}{d.line}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sequencer / Token Analyzer */}
                            <div className="glass-panel p-6 rounded-lg border border-yellow-900 bg-black/40">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-orbitron text-yellow-400 flex items-center gap-2">
                                        <BarChart3 size={20} /> Sequencer
                                    </h3>
                                    <button
                                        onClick={() => {
                                            if (sequencerRunning) return;
                                            setSequencerRunning(true);
                                            setTokenSamples([]);
                                            setEntropyScore(0);

                                            let samples: string[] = [];
                                            let sampleCount = 0;
                                            const interval = setInterval(() => {
                                                if (sampleCount >= 20) {
                                                    setSequencerRunning(false);
                                                    clearInterval(interval);
                                                    // Calculate entropy (simplified)
                                                    const uniqueChars = new Set(samples.join('')).size;
                                                    const entropy = Math.min(100, (uniqueChars / 62) * 100); // 62 = a-zA-Z0-9
                                                    setEntropyScore(Math.round(entropy));
                                                    return;
                                                }
                                                const token = Math.random().toString(36).substr(2, 32) + Math.random().toString(36).substr(2, 32);
                                                samples.push(token);
                                                setTokenSamples([...samples]);
                                                sampleCount++;
                                            }, 200);
                                        }}
                                        disabled={sequencerRunning}
                                        className="px-4 py-2 bg-yellow-900/30 border border-yellow-500 text-yellow-400 rounded font-bold hover:bg-yellow-900/50 disabled:opacity-50"
                                    >
                                        {sequencerRunning ? 'ANALYZING...' : 'ANALYZE'}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-xs text-gray-500">Session Token Analysis</div>
                                    <div className="bg-black p-3 rounded border border-yellow-900 max-h-32 overflow-y-auto font-mono text-xs">
                                        {tokenSamples.length === 0 ? (
                                            <div className="text-center text-gray-600 py-4">No tokens collected...</div>
                                        ) : (
                                            tokenSamples.map((token, i) => (
                                                <div key={i} className="text-gray-400 truncate">
                                                    [{i + 1}] {token}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {entropyScore > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Randomness Score</span>
                                                <span className={entropyScore > 80 ? 'text-green-500' : entropyScore > 50 ? 'text-yellow-500' : 'text-red-500'}>
                                                    {entropyScore}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-black rounded-full overflow-hidden border border-yellow-900">
                                                <div
                                                    className={`h-full transition-all ${entropyScore > 80 ? 'bg-green-500' : entropyScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${entropyScore}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {entropyScore > 80 ? '✓ Strong entropy - Tokens appear secure' :
                                                    entropyScore > 50 ? '⚠ Medium entropy - Predictable patterns detected' :
                                                        '✗ Weak entropy - Tokens may be guessable'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Advanced Web Brute Force Attack */}
                        <div className="glass-panel p-6 rounded-lg border border-red-900 bg-black/40">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-orbitron text-red-400 flex items-center gap-2">
                                    <Crosshair size={20} /> Web Brute Force Attack
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Wordlist: {passwordWordlist.length} passwords</span>
                                    <button
                                        onClick={async () => {
                                            if (bruteForceRunning) {
                                                setBruteForceRunning(false);
                                                return;
                                            }

                                            setBruteForceRunning(true);
                                            setBruteForceProgress(0);
                                            setBruteForceAttempts(0);
                                            setBruteForceSuccess(null);
                                            setBruteForceLog([]);

                                            const passwords = passwordWordlist;
                                            const totalPasswords = passwords.length;
                                            let attemptCount = 0;
                                            let found = false;

                                            const attackInterval = setInterval(() => {
                                                if (!bruteForceRunning || found || attemptCount >= totalPasswords) {
                                                    setBruteForceRunning(false);
                                                    clearInterval(attackInterval);
                                                    return;
                                                }

                                                // Simulate batch of attempts (for speed)
                                                const batchSize = Math.min(10, totalPasswords - attemptCount);
                                                const newLogs: any[] = [];

                                                for (let i = 0; i < batchSize; i++) {
                                                    const password = passwords[attemptCount + i];
                                                    const now = new Date().toLocaleTimeString();

                                                    // Simulate HTTP request
                                                    const statusCodes = [401, 401, 401, 401, 401, 401, 401, 401, 403, 500];
                                                    const randomStatus = statusCodes[Math.floor(Math.random() * statusCodes.length)];

                                                    // Random chance of success (simulated)
                                                    const isSuccess = Math.random() > 0.998 ||
                                                        (password === 'admin' && Math.random() > 0.95) ||
                                                        (password === 'password' && Math.random() > 0.95) ||
                                                        (password === 'admin123' && Math.random() > 0.9);

                                                    const log = {
                                                        time: now,
                                                        username: bruteForceUsername,
                                                        password: password,
                                                        status: isSuccess ? 200 : randomStatus,
                                                        success: isSuccess
                                                    };

                                                    newLogs.push(log);

                                                    if (isSuccess && !found) {
                                                        found = true;
                                                        setBruteForceSuccess({ username: bruteForceUsername, password });
                                                        setBruteForceRunning(false);
                                                    }
                                                }

                                                setBruteForceLog(prev => [...newLogs.reverse(), ...prev].slice(0, 15));
                                                attemptCount += batchSize;
                                                setBruteForceAttempts(attemptCount);
                                                setBruteForceProgress(Math.round((attemptCount / totalPasswords) * 100));

                                            }, 1000 / (bruteForceSpeed / 10)); // Adjust speed
                                        }}
                                        className={`px-4 py-2 rounded font-bold transition-all ${bruteForceRunning
                                                ? 'bg-red-500 text-black animate-pulse'
                                                : bruteForceSuccess
                                                    ? 'bg-green-500 text-black'
                                                    : 'bg-transparent border border-red-500 text-red-400 hover:bg-red-900/30'
                                            }`}
                                    >
                                        {bruteForceRunning ? 'STOP ATTACK' : bruteForceSuccess ? 'CRACKED!' : 'START ATTACK'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Configuration */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Target URL</label>
                                        <input
                                            type="text"
                                            value={bruteForceTarget}
                                            onChange={(e) => setBruteForceTarget(e.target.value)}
                                            disabled={bruteForceRunning}
                                            className="w-full bg-black border border-red-900 rounded px-3 py-2 text-xs text-gray-300 font-mono"
                                            placeholder="https://target.com/api/login"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Username</label>
                                        <input
                                            type="text"
                                            value={bruteForceUsername}
                                            onChange={(e) => setBruteForceUsername(e.target.value)}
                                            disabled={bruteForceRunning}
                                            className="w-full bg-black border border-red-900 rounded px-3 py-2 text-xs text-gray-300 font-mono"
                                            placeholder="admin"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Method</label>
                                        <select
                                            value={bruteForceMethod}
                                            onChange={(e) => setBruteForceMethod(e.target.value as any)}
                                            disabled={bruteForceRunning}
                                            className="w-full bg-black border border-red-900 rounded px-3 py-2 text-xs text-gray-300"
                                        >
                                            <option value="POST">POST</option>
                                            <option value="GET">GET</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Attack Speed Control */}
                                <div>
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Attack Speed</span>
                                        <span>{bruteForceSpeed} req/sec</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="200"
                                        step="10"
                                        value={bruteForceSpeed}
                                        onChange={(e) => setBruteForceSpeed(parseInt(e.target.value))}
                                        disabled={bruteForceRunning}
                                        className="w-full"
                                    />
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="text-red-400">{bruteForceAttempts} / {passwordWordlist.length} ({bruteForceProgress}%)</span>
                                    </div>
                                    <div className="h-2 bg-black rounded-full overflow-hidden border border-red-900">
                                        <div
                                            className="h-full bg-red-500 transition-all"
                                            style={{ width: `${bruteForceProgress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Success Banner */}
                                {bruteForceSuccess && (
                                    <div className="bg-green-900/20 border-2 border-green-500 rounded p-4 text-center animate-pulse">
                                        <div className="text-green-500 font-bold text-lg mb-2">✓ CREDENTIALS FOUND!</div>
                                        <div className="font-mono text-sm">
                                            <span className="text-gray-400">Username: </span>
                                            <span className="text-green-400 font-bold">{bruteForceSuccess.username}</span>
                                            <span className="text-gray-400 mx-2">|</span>
                                            <span className="text-gray-400">Password: </span>
                                            <span className="text-green-400 font-bold">{bruteForceSuccess.password}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Attack Log */}
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                        <Terminal size={14} />
                                        <span>Live Attack Log</span>
                                        {bruteForceRunning && <Loader2 size={12} className="animate-spin text-red-500" />}
                                    </div>
                                    <div className="bg-black p-3 rounded border border-red-900 font-mono text-xs max-h-64 overflow-y-auto">
                                        {bruteForceLog.length === 0 ? (
                                            <div className="text-center text-gray-600 py-4">No attack attempts yet...</div>
                                        ) : (
                                            <div className="space-y-1">
                                                {bruteForceLog.map((log, i) => (
                                                    <div key={i} className={`flex justify-between items-center py-1 px-2 rounded ${log.success ? 'bg-green-900/30 border border-green-500' : 'bg-gray-900/20'
                                                        }`}>
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <span className="text-gray-600 w-16">{log.time}</span>
                                                            <span className="text-gray-500">→</span>
                                                            <span className="text-gray-400">{log.username}</span>
                                                            <span className="text-gray-600">:</span>
                                                            <span className="text-gray-300">{log.password}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-bold ${log.status === 200 ? 'text-green-500' :
                                                                    log.status === 401 ? 'text-red-500' :
                                                                        log.status === 403 ? 'text-orange-500' :
                                                                            'text-gray-500'
                                                                }`}>
                                                                {log.status}
                                                            </span>
                                                            {log.success && <CheckCircle size={14} className="text-green-500" />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-black p-3 rounded border border-red-900/30 text-center">
                                        <div className="text-xs text-gray-500">Total Attempts</div>
                                        <div className="text-xl font-mono text-red-400">{bruteForceAttempts}</div>
                                    </div>
                                    <div className="bg-black p-3 rounded border border-red-900/30 text-center">
                                        <div className="text-xs text-gray-500">Success Rate</div>
                                        <div className="text-xl font-mono text-red-400">
                                            {bruteForceAttempts > 0 ? ((bruteForceSuccess ? 1 : 0) / bruteForceAttempts * 100).toFixed(2) : 0}%
                                        </div>
                                    </div>
                                    <div className="bg-black p-3 rounded border border-red-900/30 text-center">
                                        <div className="text-xs text-gray-500">Est. Time</div>
                                        <div className="text-xl font-mono text-red-400">
                                            {bruteForceRunning && bruteForceAttempts > 0
                                                ? `${Math.round((passwordWordlist.length - bruteForceAttempts) / (bruteForceSpeed / 10))}s`
                                                : '0s'
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-900/20 border border-orange-500 rounded p-3 text-xs text-orange-400">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle size={14} />
                                        <span className="font-bold">EDUCATIONAL PURPOSE ONLY</span>
                                    </div>
                                    <div className="text-orange-300">
                                        This tool is for authorized penetration testing only. Unauthorized access to computer systems is illegal.
                                    </div>
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
