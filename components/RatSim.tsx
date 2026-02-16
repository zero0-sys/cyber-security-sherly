
import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, Camera, FileText, Terminal as TerminalIcon, 
  Power, Lock, Eye, AlertTriangle, Play, Disc, Cpu, Activity,
  Smartphone, Monitor, Tablet, FolderPlus, FilePlus, Trash2, Copy, Check, Search
} from 'lucide-react';

interface FileItem {
    name: string;
    type: 'Folder' | 'Text Document' | 'Image' | 'Executable' | 'Archive' | 'System' | 'Database';
    date: string;
    size: string;
}

interface TargetSystem {
    os: string;
    user: string;
    hostname: string;
    ip: string;
    icon: any;
    defaultFiles: FileItem[];
}

const RatSim: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'screen' | 'webcam' | 'files' | 'terminal' | 'processes' | 'keylogger'>('screen');
  const [isBSOD, setIsBSOD] = useState(false);
  
  // New States for Dynamic Target
  const [targetInput, setTargetInput] = useState("");
  const [currentTarget, setCurrentTarget] = useState<TargetSystem | null>(null);
  const [fileSystem, setFileSystem] = useState<FileItem[]>([]);
  const [clipboard, setClipboard] = useState<string | null>(null);

  // OS Profiles
  const getProfile = (code: string): TargetSystem => {
      const c = code.toLowerCase();
      const ip = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
      
      if (c.includes('lin')) return {
          os: "Ubuntu 22.04 LTS (Linux)", user: "root", hostname: "SRV-PROD-01", ip, icon: TerminalIcon,
          defaultFiles: [
              { name: ".ssh", type: "Folder", date: "01/12/2024", size: "-" },
              { name: "etc", type: "Folder", date: "01/12/2024", size: "-" },
              { name: "var", type: "Folder", date: "01/12/2024", size: "-" },
              { name: "config.yaml", type: "Text Document", date: "05/20/2024", size: "4 KB" },
              { name: "backup.tar.gz", type: "Archive", date: "10/24/2024", size: "2.4 GB" },
          ]
      };
      if (c.includes('mac')) return {
          os: "macOS Sonoma", user: "developer", hostname: "MACBOOK-PRO-M3", ip, icon: Laptop,
          defaultFiles: [
              { name: "Applications", type: "Folder", date: "08/14/2024", size: "-" },
              { name: "Library", type: "Folder", date: "08/14/2024", size: "-" },
              { name: "Documents", type: "Folder", date: "10/20/2024", size: "-" },
              { name: "keychain.db", type: "Database", date: "08/15/2024", size: "24 MB" },
              { name: "Project Alpha", type: "Folder", date: "10/25/2024", size: "-" },
          ]
      };
      if (c.includes('and')) return {
          os: "Android 14", user: "mobile_user", hostname: "SAMSUNG-S24", ip, icon: Smartphone,
          defaultFiles: [
              { name: "DCIM", type: "Folder", date: "10/25/2024", size: "-" },
              { name: "Download", type: "Folder", date: "10/24/2024", size: "-" },
              { name: "WhatsApp", type: "Folder", date: "10/22/2024", size: "-" },
              { name: "base.apk", type: "Executable", date: "09/10/2024", size: "45 MB" },
          ]
      };
      if (c.includes('ios') || c.includes('iphone')) return {
          os: "iOS 17.4", user: "iphone_admin", hostname: "IPHONE-15-PRO", ip, icon: Smartphone,
          defaultFiles: [
              { name: "DCIM", type: "Folder", date: "10/25/2024", size: "-" },
              { name: "PhotoData", type: "Folder", date: "10/25/2024", size: "-" },
              { name: "ApplicationSupport", type: "Folder", date: "10/20/2024", size: "-" },
              { name: "SMS.db", type: "Database", date: "10/25/2024", size: "12 MB" },
          ]
      };
      // Default Windows
      return {
          os: "Windows 11 Pro", user: "Administrator", hostname: "WIN-CORP-WORKSTATION", ip, icon: Monitor,
          defaultFiles: [
              { name: "Documents", type: "Folder", date: "10/24/2024", size: "-" },
              { name: "Pictures", type: "Folder", date: "10/24/2024", size: "-" },
              { name: "Downloads", type: "Folder", date: "10/24/2024", size: "-" },
              { name: "passwords.txt", type: "Text Document", date: "09/15/2024", size: "12 KB" },
              { name: "financial_report.xlsx", type: "Text Document", date: "10/01/2024", size: "450 KB" },
              { name: "steam_setup.exe", type: "Executable", date: "10/20/2024", size: "2.5 MB" },
          ]
      };
  };

  // Connection Simulation
  const connect = () => {
    if (!targetInput) {
        setLog(["ERROR: Please enter a target code or IP to initiate connection."]);
        return;
    }

    const profile = getProfile(targetInput);
    setCurrentTarget(profile);
    setFileSystem(profile.defaultFiles);

    setConnectionProgress(0);
    setLog([]);
    const steps = [
        "Initializing Reverse TCP Handler...",
        `Target identified: ${profile.os}`,
        `Handshake with ${profile.ip} established`,
        "Sending Stage (2048 bytes)...",
        "Meterpreter session 1 opened."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            setLog(prev => [...prev, steps[i]]);
            setConnectionProgress(prev => prev + 20);
            i++;
        } else {
            clearInterval(interval);
            setIsConnected(true);
        }
    }, 600);
  };

  const disconnect = () => {
      setIsConnected(false);
      setIsBSOD(false);
      setConnectionProgress(0);
      setCurrentTarget(null);
      setTargetInput("");
  };

  const triggerBSOD = () => {
      setIsBSOD(true);
      setLog(prev => [...prev, "Executing payload: system_crash_trigger... SUCCESS"]);
  };

  // File System Operations
  const addFile = () => {
      const newFile: FileItem = {
          name: `new_file_${Math.floor(Math.random()*100)}.txt`,
          type: 'Text Document',
          date: new Date().toLocaleDateString(),
          size: '0 KB'
      };
      setFileSystem([...fileSystem, newFile]);
  };

  const addFolder = () => {
      const newFolder: FileItem = {
          name: `New Folder ${Math.floor(Math.random()*10)}`,
          type: 'Folder',
          date: new Date().toLocaleDateString(),
          size: '-'
      };
      setFileSystem([newFolder, ...fileSystem]);
  };

  const deleteFile = (index: number) => {
      const newFs = [...fileSystem];
      newFs.splice(index, 1);
      setFileSystem(newFs);
  };

  const copyFile = (file: FileItem) => {
      setClipboard(file.name);
      setTimeout(() => setClipboard(null), 2000); // Reset toast after 2s
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Control Bar - Updated for Dynamic Input */}
      <div className="glass-panel p-4 rounded-lg border border-green-900 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4 w-full md:w-auto">
             <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             
             {!isConnected ? (
                 <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2 text-gray-500" size={14} />
                        <input 
                            type="text" 
                            placeholder="Enter Code (e.g., win, linux, ios, android)..."
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            className="bg-gray-900 border border-green-900 rounded pl-8 pr-4 py-1.5 text-sm text-green-400 w-full md:w-64 focus:border-green-500 outline-none"
                        />
                    </div>
                 </div>
             ) : (
                 <div className="flex items-center gap-4">
                     {currentTarget?.icon && <currentTarget.icon size={24} className="text-green-500" />}
                     <div>
                         <h2 className="font-orbitron text-lg text-white leading-tight">{currentTarget?.hostname}</h2>
                         <p className="text-xs text-gray-500 font-mono">IP: {currentTarget?.ip} | OS: {currentTarget?.os}</p>
                     </div>
                 </div>
             )}
         </div>
         
         <div className="flex gap-2 w-full md:w-auto justify-end">
             {!isConnected ? (
                 <button onClick={connect} className="bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded font-bold font-mono text-xs flex items-center gap-2 transition-all">
                     <Play size={14} /> ESTABLISH SESSION
                 </button>
             ) : (
                 <button onClick={disconnect} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold font-mono text-xs flex items-center gap-2 transition-all">
                     <Power size={14} /> TERMINATE
                 </button>
             )}
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
          {/* Sidebar Actions */}
          <div className="glass-panel p-2 rounded-lg border border-green-900 bg-black/40 flex flex-col gap-2 overflow-y-auto">
              <div className="p-2 text-xs text-gray-500 font-bold uppercase tracking-wider">Surveillance</div>
              <ActionButton icon={<Monitor size={16} />} label="Live Desktop" active={currentView === 'screen'} onClick={() => setCurrentView('screen')} disabled={!isConnected} />
              <ActionButton icon={<Camera size={16} />} label="Webcam Stream" active={currentView === 'webcam'} onClick={() => setCurrentView('webcam')} disabled={!isConnected} />
              <ActionButton icon={<Eye size={16} />} label="Keylogger" active={currentView === 'keylogger'} onClick={() => setCurrentView('keylogger')} disabled={!isConnected} />
              
              <div className="p-2 text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">File System</div>
              <ActionButton icon={<FileText size={16} />} label="File Explorer" active={currentView === 'files'} onClick={() => setCurrentView('files')} disabled={!isConnected} />
              <ActionButton icon={<Disc size={16} />} label="Download SAM" onClick={() => {}} disabled={!isConnected} />

              <div className="p-2 text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">System Control</div>
              <ActionButton icon={<TerminalIcon size={16} />} label="Remote Shell" active={currentView === 'terminal'} onClick={() => setCurrentView('terminal')} disabled={!isConnected} />
              <ActionButton icon={<Cpu size={16} />} label="Process Manager" active={currentView === 'processes'} onClick={() => setCurrentView('processes')} disabled={!isConnected} />
              <ActionButton icon={<Lock size={16} />} label="Lock Screen" onClick={() => {}} disabled={!isConnected} />
              <button 
                  onClick={triggerBSOD}
                  disabled={!isConnected}
                  className="p-3 rounded text-left flex items-center gap-3 transition-colors text-xs font-mono font-bold text-red-500 hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                  <AlertTriangle size={16} /> TRIGGER BSOD
              </button>
          </div>

          {/* Main Viewport */}
          <div className="lg:col-span-3 glass-panel rounded-lg border border-green-900 bg-black overflow-hidden relative flex flex-col">
              {!isConnected ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 font-mono">
                      {connectionProgress > 0 && connectionProgress < 100 ? (
                          <div className="w-64">
                              <div className="text-green-500 text-xs mb-2">Connecting to {targetInput}... {connectionProgress}%</div>
                              <div className="h-1 bg-gray-800 rounded overflow-hidden">
                                  <div className="h-full bg-green-500 transition-all" style={{width: `${connectionProgress}%`}}></div>
                              </div>
                              <div className="mt-4 text-xs font-mono text-left space-y-1">
                                  {log.map((l, i) => <div key={i} className="text-green-400/70">{l}</div>)}
                              </div>
                          </div>
                      ) : (
                          <>
                            <Laptop size={64} className="mb-4 opacity-20" />
                            <p>WAITING FOR CONNECTION...</p>
                            <p className="text-xs text-gray-500 mt-2">ENTER TARGET CODE TO BEGIN</p>
                          </>
                      )}
                  </div>
              ) : (
                  // SIMULATED REMOTE SCREEN
                  <div className="flex-1 relative bg-gray-900 flex flex-col h-full">
                      {currentView === 'screen' && (
                          isBSOD ? (
                              <div className="absolute inset-0 bg-blue-700 text-white font-mono p-20 flex flex-col items-start pt-40 z-50">
                                  <div className="text-6xl mb-8">:(</div>
                                  <div className="text-2xl mb-8">Your PC ran into a problem and needs to restart.</div>
                                  <div className="text-sm">Stop Code: CRITICAL_PROCESS_DIED</div>
                              </div>
                          ) : (
                              // Fake Desktop Based on OS
                              <div className="absolute inset-0 relative overflow-hidden group select-none">
                                  <div className={`absolute inset-0 bg-cover ${
                                      currentTarget?.os.includes("Win") ? "bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop')]" :
                                      currentTarget?.os.includes("Mac") ? "bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop')]" :
                                      currentTarget?.os.includes("Linux") ? "bg-[url('https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=1974&auto=format&fit=crop')]" :
                                      "bg-gray-800"
                                  }`}></div>
                                  
                                  {/* Mobile View Simulation for Android/iOS */}
                                  {(currentTarget?.os.includes("Android") || currentTarget?.os.includes("iOS")) && (
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                          <div className="border-4 border-gray-800 rounded-3xl w-64 h-[500px] bg-black/90 relative overflow-hidden flex flex-col items-center justify-center text-gray-500">
                                              <Smartphone size={48} className="mb-2" />
                                              <p>Mirroring Screen...</p>
                                          </div>
                                      </div>
                                  )}

                                  {/* Window Simulation for Desktop */}
                                  {(!currentTarget?.os.includes("Android") && !currentTarget?.os.includes("iOS")) && (
                                      <div className="absolute top-10 left-20 w-1/2 h-1/2 bg-white rounded shadow-xl flex flex-col">
                                          <div className="h-8 bg-gray-200 border-b flex items-center justify-end px-2 gap-2">
                                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                          </div>
                                          <div className="flex-1 p-4 font-sans text-black">
                                              <h1 className="text-2xl font-bold mb-2">Confidential Info</h1>
                                              <p>Target: {currentTarget?.hostname}</p>
                                              <p>User: {currentTarget?.user}</p>
                                              <p className="mt-4 text-gray-500">Live remote session active.</p>
                                          </div>
                                      </div>
                                  )}

                                  {/* Taskbar */}
                                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-900/90 flex items-center px-4 gap-4">
                                      <div className={`w-6 h-6 rounded-sm ${currentTarget?.os.includes("Win") ? "bg-blue-500" : "bg-gray-500"}`}></div>
                                      <div className="flex-1"></div>
                                      <div className="text-white text-xs">LIVE CONNECTION</div>
                                  </div>
                              </div>
                          )
                      )}

                      {currentView === 'webcam' && (
                          <div className="absolute inset-0 bg-black flex items-center justify-center">
                              <div className="text-green-500 text-center">
                                  <Camera size={48} className="mx-auto mb-4 animate-pulse" />
                                  <p>RECEIVING VIDEO FEED...</p>
                                  <p className="text-xs text-gray-500 mt-2">SIGNAL WEAK (Packet Loss: 12%)</p>
                              </div>
                          </div>
                      )}
                      
                      {/* Enhanced File Explorer */}
                      {currentView === 'files' && (
                          <div className="absolute inset-0 bg-gray-100 text-black font-sans flex flex-col">
                              {/* Explorer Toolbar */}
                              <div className="bg-gray-200 p-2 border-b border-gray-300 flex items-center gap-2">
                                  <button onClick={addFolder} className="p-1 hover:bg-gray-300 rounded text-gray-700" title="New Folder">
                                      <FolderPlus size={18} />
                                  </button>
                                  <button onClick={addFile} className="p-1 hover:bg-gray-300 rounded text-gray-700" title="New File">
                                      <FilePlus size={18} />
                                  </button>
                                  <div className="h-4 w-px bg-gray-400 mx-2"></div>
                                  <span className="text-xs text-gray-500 flex-1">/{currentTarget?.user}/home/</span>
                                  {clipboard && <span className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-100 px-2 rounded"><Check size={12}/> Copied: {clipboard}</span>}
                              </div>

                              {/* File List */}
                              <div className="flex-1 overflow-auto p-4">
                                  <div className="border-b pb-2 mb-2 font-bold flex gap-4 text-gray-700 text-xs uppercase tracking-wider">
                                      <span className="flex-1">Name</span>
                                      <span className="w-32">Date Modified</span>
                                      <span className="w-24">Type</span>
                                      <span className="w-20">Size</span>
                                      <span className="w-24 text-right">Actions</span>
                                  </div>
                                  {fileSystem.map((f, i) => (
                                      <div key={i} className="flex gap-4 py-2 hover:bg-blue-50 cursor-pointer text-sm items-center border-b border-gray-100 group">
                                          <span className="flex-1 flex items-center gap-3">
                                              <div className={`w-5 h-5 flex items-center justify-center rounded ${
                                                  f.type === 'Folder' ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'
                                              }`}>
                                                  {f.type === 'Folder' ? <div className="w-4 h-3 bg-yellow-500 rounded-sm relative"><div className="absolute -top-1 left-0 w-2 h-1 bg-yellow-500 rounded-t-sm"></div></div> : <FileText size={16}/>}
                                              </div>
                                              {f.name}
                                          </span>
                                          <span className="w-32 text-gray-500 text-xs">{f.date}</span>
                                          <span className="w-24 text-gray-500 text-xs">{f.type}</span>
                                          <span className="w-20 text-gray-500 text-xs font-mono">{f.size}</span>
                                          <span className="w-24 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={(e) => { e.stopPropagation(); copyFile(f); }} className="text-blue-500 hover:text-blue-700" title="Copy">
                                                  <Copy size={14} />
                                              </button>
                                              <button onClick={(e) => { e.stopPropagation(); deleteFile(i); }} className="text-red-500 hover:text-red-700" title="Delete">
                                                  <Trash2 size={14} />
                                              </button>
                                          </span>
                                      </div>
                                  ))}
                                  {fileSystem.length === 0 && (
                                      <div className="text-center py-10 text-gray-400 italic">Folder is empty</div>
                                  )}
                              </div>
                          </div>
                      )}

                      {currentView === 'terminal' && (
                          <FakeTerminal user={currentTarget?.user || 'user'} hostname={currentTarget?.hostname || 'host'} />
                      )}

                      {currentView === 'processes' && (
                          <div className="absolute inset-0 bg-white text-black font-sans text-xs overflow-auto">
                              <table className="w-full text-left">
                                  <thead className="bg-gray-200 sticky top-0">
                                      <tr>
                                          <th className="p-2">Image Name</th>
                                          <th className="p-2">PID</th>
                                          <th className="p-2">User</th>
                                          <th className="p-2">Mem Usage</th>
                                          <th className="p-2">Action</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {[
                                          { name: "systemd", pid: 1, mem: "120 K" },
                                          { name: "sshd", pid: 348, mem: "4,456 K" },
                                          { name: "bash", pid: 524, mem: "3,450 K" },
                                          { name: "python3", pid: 612, mem: "12,200 K" },
                                          { name: "dockerd", pid: 668, mem: "55,600 K" },
                                          { name: "nginx", pid: 890, mem: "8,900 K" },
                                          { name: "meterpreter", pid: 4520, mem: "14,000 K" },
                                      ].map((p,i) => (
                                          <tr key={i} className="border-b hover:bg-blue-50">
                                              <td className="p-2 font-bold">{p.name}</td>
                                              <td className="p-2 font-mono">{p.pid}</td>
                                              <td className="p-2">{currentTarget?.user || 'root'}</td>
                                              <td className="p-2">{p.mem}</td>
                                              <td className="p-2 text-red-600 hover:underline cursor-pointer font-bold">Kill</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}

                      {currentView === 'keylogger' && (
                          <FakeKeylogger />
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

// Sub-components for RAT
const FakeTerminal: React.FC<{user: string, hostname: string}> = ({user, hostname}) => {
    const [lines, setLines] = useState<string[]>([`Connected to ${hostname}...`, "Initializing shell...", "", `${user}@${hostname}:~$`]);
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            const newLines = [...lines, input];
            
            // Basic Fake Responses
            if (cmd === 'ls') {
                newLines.push("Documents  Downloads  Pictures  Music  Public  Desktop");
            } else if (cmd === 'whoami') {
                newLines.push(user);
            } else if (cmd === 'pwd') {
                newLines.push(`/home/${user}`);
            } else if (cmd === 'clear') {
                setLines([`${user}@${hostname}:~$`]);
                setInput("");
                return;
            } else if (cmd !== "") {
                newLines.push(`bash: ${cmd.split(' ')[0]}: command not found`);
            }

            newLines.push("", `${user}@${hostname}:~$`);
            setLines(newLines);
            setInput("");
        }
    };

    return (
        <div className="absolute inset-0 bg-black text-gray-300 font-mono p-2 text-sm overflow-auto">
            {lines.map((l, i) => <div key={i} className="whitespace-pre-wrap min-h-[1.2em]">{l}</div>)}
            <div className="flex">
                <input 
                    className="flex-1 bg-transparent outline-none text-gray-300"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            </div>
            <div ref={endRef} />
        </div>
    );
};

const FakeKeylogger = () => {
    const [loggedText, setLoggedText] = useState("");
    
    useEffect(() => {
        const phrases = [
            "facebook.com[ENTER]", "my_email@gmail.com[TAB]", "Hunter2![ENTER]",
            "[ALT+TAB] notepad.exe[ENTER]", "Dear diary, today I...", 
            "[BACKSPACE][BACKSPACE]Boss is annoying.", 
            "[ALT+TAB] bankofamerica.com[ENTER]", "user_admin[TAB]", "supersecret123[ENTER]"
        ];
        
        let phraseIndex = 0;
        let charIndex = 0;

        const interval = setInterval(() => {
            if (phraseIndex >= phrases.length) {
                phraseIndex = 0; // Loop
            }
            
            const currentPhrase = phrases[phraseIndex];
            setLoggedText(prev => prev + currentPhrase[charIndex]);
            
            charIndex++;
            if (charIndex >= currentPhrase.length) {
                setLoggedText(prev => prev + " ");
                phraseIndex++;
                charIndex = 0;
            }
        }, 150); // Typing speed

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 bg-gray-100 text-black font-mono p-4 overflow-auto">
            <h3 className="border-b border-gray-300 pb-2 mb-2 font-bold uppercase text-gray-500">Live Keystroke Capture</h3>
            <div className="whitespace-pre-wrap">{loggedText}<span className="animate-pulse bg-black text-white px-1"> </span></div>
        </div>
    );
};

const ActionButton: React.FC<{icon: any, label: string, onClick: () => void, disabled?: boolean, active?: boolean}> = ({icon, label, onClick, disabled, active}) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`p-3 rounded text-left flex items-center gap-3 transition-colors text-xs font-mono font-bold ${
            active 
            ? 'bg-green-900/40 text-green-400 border border-green-500' 
            : 'text-gray-400 hover:bg-green-900/20 hover:text-green-300'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
        {icon} {label}
    </button>
);

export default RatSim;
