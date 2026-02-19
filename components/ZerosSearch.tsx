import React, { useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';

const ZerosSearch: React.FC = () => {
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load Google CSE script
        const existingScript = document.querySelector('script[src*="cse.google.com/cse.js"]');
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://cse.google.com/cse.js?cx=676e2e12839934c63';
            script.async = true;
            document.head.appendChild(script);
        }

        // If CSE is already loaded, render it
        if ((window as any).__gcse) {
            (window as any).__gcse.initializeParsing?.();
        }

        return () => {
            // Cleanup: don't remove script as it may be reused
        };
    }, []);

    // Re-render CSE when container mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            if ((window as any).google?.search?.cse?.element) {
                (window as any).google.search.cse.element.render(
                    { div: searchContainerRef.current, tag: 'search' }
                );
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col h-full bg-black text-green-400 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-3 p-4 relative z-10 border-b border-green-900">
                <div className="p-2.5 bg-green-900/20 rounded-lg border border-green-500/50 shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                    <Globe size={20} className="text-green-400" />
                </div>
                <div>
                    <h1 className="text-xl font-orbitron font-bold text-white tracking-widest">ZEROS SEARCH</h1>
                    <p className="text-[10px] font-mono text-green-600 tracking-[0.3em]">SECURE_GATEWAY_V1.0</p>
                </div>
            </div>

            {/* Google CSE Container */}
            <div className="flex-1 overflow-auto p-4 relative z-10 custom-scrollbar-green" style={{ overflowX: 'hidden' }}>
                <div className="w-full max-w-2xl mx-auto flex flex-col gap-4" id="zeros-search-wrapper">
                    {/* Disclaimer */}
                    <div className="text-[10px] text-green-500/50 font-mono text-center border-b border-green-900/30 pb-2 mb-2">
                        NOTE: SEARCH RESULTS OPEN IN NEW TABS FOR SECURITY ISOLATION.
                    </div>
                    <div className="gcse-search" ref={searchContainerRef} data-linktarget="_blank"></div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar-green::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-green::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
                .custom-scrollbar-green::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.2); border-radius: 3px; }
                .custom-scrollbar-green::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 65, 0.4); }

                /* ===== RESPONSIVE FIX: Force CSE to fit within container ===== */
                #zeros-search-wrapper,
                #zeros-search-wrapper * {
                    box-sizing: border-box !important;
                    max-width: 100% !important;
                }
                
                /* Override Google CSE styles to match dark theme CRITICAL FIXES */
                .gsc-control-cse {
                    background-color: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                }
                
                /* Input Field Styling */
                .gsc-input-box {
                    background: #050505 !important;
                    border: 1px solid rgba(0, 255, 65, 0.3) !important;
                    border-radius: 8px !important;
                    height: 44px !important;
                    box-shadow: none !important;
                }
                .gsc-input {
                    background: transparent !important;
                    color: #4ade80 !important;
                    font-family: monospace !important;
                    padding-right: 10px !important; 
                }
                /* Place holder text color fix (hard to target directly in CSE but we try) */
                input.gsc-input::placeholder { color: #15803d !important; opacity: 0.7; }
                
                /* Search Button */
                .gsc-search-button-v2 {
                    background: rgba(0, 255, 65, 0.1) !important;
                    border: 1px solid rgba(0, 255, 65, 0.3) !important;
                    border-radius: 8px !important;
                    padding: 10px 20px !important;
                    margin-left: 8px !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                }
                .gsc-search-button-v2:hover {
                    background: rgba(0, 255, 65, 0.2) !important;
                    box-shadow: 0 0 10px rgba(0, 255, 65, 0.2) !important;
                }
                .gsc-search-button-v2 svg { fill: #4ade80 !important; }
                
                /* Results Container */
                .gsc-results-wrapper-nooverlay {
                    background: transparent !important;
                    color: #fff !important;
                }
                
                /* Individual Result Card */
                .gsc-webResult.gsc-result {
                    background: rgba(10, 10, 10, 0.6) !important;
                    border: 1px solid rgba(0, 255, 65, 0.1) !important;
                    border-left: 3px solid rgba(0, 255, 65, 0.3) !important;
                    border-radius: 6px !important;
                    padding: 12px 16px !important;
                    margin-bottom: 12px !important;
                    box-shadow: none !important;
                    transition: all 0.2s !important;
                }
                .gsc-webResult.gsc-result:hover {
                    background: rgba(20, 20, 20, 0.8) !important;
                    border-color: rgba(0, 255, 65, 0.4) !important;
                    transform: translateX(2px);
                }
                
                /* Remove white backgrounds from CSE internals */
                .gsc-webResult.gsc-result:hover,
                .gsc-imageResult:hover,
                .gsc-results .gsc-result {
                    background-color: transparent !important;
                }
                
                /* Typography Overrides */
                .gs-title, .gs-title a, .gs-title a b {
                    color: #4ade80 !important;
                    text-decoration: none !important;
                    font-family: 'Orbitron', sans-serif !important;
                    font-size: 16px !important;
                    letter-spacing: 0.5px !important;
                }
                .gs-title a:hover {
                    text-shadow: 0 0 8px rgba(0, 255, 65, 0.6) !important;
                }
                
                .gs-snippet {
                    color: #9ca3af !important;
                    font-family: monospace !important;
                    font-size: 12px !important;
                    line-height: 1.5 !important;
                }
                
                .gs-visibleUrl, .gs-visibleUrl-short, .gs-visibleUrl-long {
                    color: #15803d !important;
                    font-family: monospace !important;
                    font-size: 10px !important;
                    margin-top: 4px !important;
                }
                
                /* Remove clutter */
                .gsc-url-top, .gsc-url-bottom { display: none !important; }
                .gsc-thumbnail-inside { padding: 0 !important; }
                .gs-image-box { border: none !important; }
                
                /* Pagination */
                .gsc-cursor-box {
                    margin-top: 20px !important;
                    text-align: center !important;
                }
                .gsc-cursor-page {
                    color: #4ade80 !important;
                    background: transparent !important;
                    border: 1px solid rgba(0, 255, 65, 0.2) !important;
                    margin: 0 4px !important;
                    padding: 4px 10px !important;
                    border-radius: 4px !important;
                    font-family: monospace !important;
                }
                .gsc-cursor-current-page {
                    background: rgba(0, 255, 65, 0.2) !important;
                    border-color: #4ade80 !important;
                    color: #fff !important;
                    text-shadow: 0 0 5px rgba(0, 255, 65, 0.8) !important;
                }
                
                /* Hide Ad blocks if any */
                .gsc-adBlock { display: none !important; }
                
                /* Fix white flash on hover/active in some browsers */
                .gsc-webResult.gsc-result:active,
                .gsc-webResult.gsc-result:focus {
                    background-color: #111 !important;
                }

                /* =========================================
                   EXPANSION MODE / IMAGE PREVIEW FIXES
                   ========================================= */
                
                /* Main Image Preview Overlay */
                .gsc-expansion-mode-overlay,
                .gsc-lightbox-main,
                .gs-imagePreviewArea, 
                .gsc-imageResult {
                    background: rgba(10, 10, 10, 0.98) !important;
                    border: 1px solid rgba(0, 255, 65, 0.2) !important;
                }

                /* Preview Box Content */
                .gs-image-preview-box, 
                .gs-image-box {
                    background: transparent !important;
                    color: #fff !important;
                    border: none !important;
                }

                /* Text constraints in preview */
                .gs-image-preview-box .gs-title,
                .gs-image-preview-box .gs-snippet,
                .gs-image-preview-box .gs-visibleUrl {
                    color: #4ade80 !important;
                    text-shadow: none !important;
                }

                /* Close Button */
                .gsc-results-close-btn {
                    background: transparent !important;
                    color: #ff4444 !important;
                    font-size: 24px !important;
                    opacity: 1 !important;
                }
                .gsc-results-close-btn:hover {
                    color: #ff0000 !important;
                    transform: scale(1.1);
                }

                /* Option Menu (if any) */
                .gsc-option-menu {
                    background: #0a0a0a !important;
                    border: 1px solid rgba(0, 255, 65, 0.3) !important;
                    color: #fff !important;
                }
                .gsc-option-menu-item {
                    color: #4ade80 !important;
                }
                .gsc-option-menu-item:hover {
                    background: rgba(0, 255, 65, 0.1) !important;
                }

                /* Tabs area in expansion mode */
                .gsc-tabsArea {
                    border-bottom: 1px solid rgba(0, 255, 65, 0.2) !important;
                }
                .gsc-tabHeader {
                    background: transparent !important;
                    color: #9ca3af !important;
                }
                .gsc-tabHeader.gsc-tabhActive {
                    background: rgba(0, 255, 65, 0.1) !important;
                    border-bottom: 2px solid #00ff41 !important;
                    color: #fff !important;
                }

                /* Remove Google Branding Backgrounds */
                .gsc-branding, 
                .gsc-branding-text, 
                .gsc-branding-img {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

export default ZerosSearch;
