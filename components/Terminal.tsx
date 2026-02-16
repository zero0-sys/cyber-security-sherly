import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { X, Terminal as TerminalIcon, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance
    const term = new XTerminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: {
        background: '#000000',
        foreground: '#00ff41',
        cursor: '#00ff41',
        selection: 'rgba(0, 255, 65, 0.3)',
        black: '#000000',
        red: '#ff0000',
        green: '#00ff41',
        yellow: '#ffff00',
        blue: '#0096ff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
        brightBlack: '#808080',
        brightRed: '#ff6b68',
        brightGreen: '#5fff87',
        brightYellow: '#ffff5f',
        brightBlue: '#6bb2ff',
        brightMagenta: '#ff92ff',
        brightCyan: '#87ffff',
        brightWhite: '#ffffff',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect to WebSocket
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3001');

      ws.onopen = () => {
        setIsConnected(true);
        term.writeln('\x1b[1;32m✓ Connected to backend terminal\x1b[0m');
        term.writeln('\x1b[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
        term.write('\r\n');
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'output') {
          term.write(msg.data);
        } else if (msg.type === 'exit') {
          term.writeln(`\r\n\x1b[1;31m✗ Shell exited with code ${msg.exitCode}\x1b[0m`);
          setIsConnected(false);
        }
      };

      ws.onerror = (error) => {
        term.writeln('\r\n\x1b[1;31m✗ WebSocket error. Is backend server running?\x1b[0m');
        setIsConnected(false);
      };

      ws.onclose = () => {
        term.writeln('\r\n\x1b[1;33m⚠ Connection closed\x1b[0m');
        setIsConnected(false);
      };

      wsRef.current = ws;

      // Send terminal input to WebSocket
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }));
        }
      });

      // Handle terminal resize
      term.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      });
    };

    connectWebSocket();

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
      term.dispose();
    };
  }, []);

  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    // Trigger re-connection via useEffect cleanup and re-run
    window.location.reload();
  };

  const handleClear = () => {
    xtermRef.current?.clear();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      fitAddonRef.current?.fit();
    }, 100);
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-green-900 bg-black">
        <div className="flex items-center gap-3">
          <TerminalIcon size={20} className="text-green-500" />
          <div>
            <h2 className="font-orbitron font-bold text-white">TERMINAL CLI</h2>
            <p className="text-xs text-gray-500 font-mono">ROOT SHELL ACCESS</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono ${isConnected
              ? 'bg-green-900/20 text-green-400 border border-green-900'
              : 'bg-red-900/20 text-red-400 border border-red-900'
            }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>

          <button
            onClick={handleClear}
            className="p-2 hover:bg-green-900/20 rounded transition-colors text-gray-400 hover:text-green-400"
            title="Clear"
          >
            <X size={18} />
          </button>

          <button
            onClick={handleReconnect}
            className="p-2 hover:bg-green-900/20 rounded transition-colors text-gray-400 hover:text-green-400"
            title="Reconnect"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-green-900/20 rounded transition-colors text-gray-400 hover:text-green-400"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 bg-black p-4 overflow-hidden">
        <div
          ref={terminalRef}
          className="h-full w-full"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-green-900 bg-black/50 text-xs text-gray-600 font-mono flex justify-between">
        <span>Press Ctrl+C to interrupt • Ctrl+D to exit</span>
        <span>Backend: ws://localhost:3001</span>
      </div>
    </div>
  );
};

export default Terminal;