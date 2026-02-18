import React, { useEffect } from 'react';
import { Search, Globe, Shield } from 'lucide-react';

const ZerosSearch: React.FC = () => {
    useEffect(() => {
        // Dynamically load Google CSE script
        const script = document.createElement('script');
        script.src = "https://cse.google.com/cse.js?cx=676e2e12839934c63";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="flex flex-col h-full bg-black text-green-400 p-4 relative overflow-hidden">
            {/* Background Matrix/Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-8 relative z-10 border-b border-green-900 pb-4">
                <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/50 shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                    <Globe size={24} className="text-green-400 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest">ZEROS SEARCH</h1>
                    <p className="text-xs font-mono text-green-600 tracking-[0.3em]">SECURE_GATEWAY_V1.0</p>
                </div>
            </div>

            {/* Search Container */}
            <div className="max-w-4xl mx-auto w-full flex-1 relative z-10">
                <div className="glass-panel p-6 rounded-xl border border-green-500/30 bg-black/60 shadow-[0_0_30px_rgba(0,255,65,0.05)]">
                    <div className="flex items-center gap-2 mb-4 text-green-500/50 text-xs font-mono uppercase">
                        <Shield size={12} />
                        <span>Encrypted uplink established</span>
                    </div>

                    {/* Google CSE Container */}
                    <div className="gcse-search"></div>
                </div>
            </div>

            {/* Cyber/Dark Theme Overrides for Google CSE */}
            <style>{`
        /* General Reset */
        .gsc-control-cse {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-family: 'Courier New', monospace !important;
        }

        /* Search Input Box */
        .gsc-input-box {
          background-color: #000000 !important;
          border: 1px solid #00ff41 !important;
          border-radius: 4px !important;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.1) !important;
        }
        
        input.gsc-input {
            background: black !important;
            color: #00ff41 !important;
            font-family: 'Courier New', monospace !important;
        }
        
        .gsc-input::-webkit-input-placeholder {
            color: #005f1f !important;
        }

        /* Search Button */
        button.gsc-search-button {
          background-color: #003300 !important;
          border: 1px solid #00ff41 !important;
          border-radius: 4px !important;
          margin-left: 10px !important;
          padding: 8px 16px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        }
        
        button.gsc-search-button:hover {
            background-color: #00ff41 !important;
            box-shadow: 0 0 15px #00ff41 !important;
        }
        
        button.gsc-search-button svg {
            fill: #00ff41 !important;
        }
        
        button.gsc-search-button:hover svg {
            fill: #000000 !important;
        }

        /* Results Container */
        .gsc-results-wrapper-overlay, .gsc-results-wrapper-visible {
            background-color: #050505 !important;
            border: 1px solid #00ff41 !important;
            box-shadow: 0 0 20px rgba(0,255,65,0.1) !important;
        }

        /* Result Items */
        .gs-webResult.gs-result {
            background-color: transparent !important;
            border-bottom: 1px solid #003300 !important;
            padding: 15px !important;
        }
        
        .gs-webResult:hover {
            background-color: rgba(0, 255, 65, 0.05) !important;
        }

        /* Titles */
        .gs-title, .gs-title b {
            color: #00ff41 !important;
            text-decoration: none !important;
            font-family: 'Orbitron', sans-serif !important;
            letter-spacing: 0.5px !important;
        }
        
        .gs-title:hover {
            text-decoration: underline !important;
            text-shadow: 0 0 5px #00ff41 !important;
        }

        /* Snippets */
        .gs-snippet {
            color: #aaaaaa !important;
            font-family: 'Courier New', monospace !important;
            font-size: 14px !important;
        }

        /* URL/Breadcrumbs */
        .gs-visibleUrl {
            color: #008f24 !important;
            font-size: 12px !important;
        }

        /* Remove Google Branding/Backgrounds */
        .gsc-adBlock { display: none !important; }
        .gsc-control-cse, .gsc-control-cse-en {
            background-color: transparent !important;
        }
        .gsc-webResult.gsc-result {
            background-color: transparent !important;
        }
        
        /* Pagination */
        .gsc-cursor-page {
            color: #00ff41 !important;
            background: transparent !important;
            border: 1px solid #00ff41 !important;
            margin-right: 5px !important;
        }
        
        .gsc-cursor-current-page {
            color: black !important;
            background-color: #00ff41 !important;
            border: 1px solid #00ff41 !important;
        }
        
      `}</style>
        </div>
    );
};

export default ZerosSearch;
