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
                <div className="w-full max-w-4xl mx-auto" id="zeros-search-wrapper">
                    <div className="gcse-search" ref={searchContainerRef}></div>
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
                /* Fix table-based layout overflow */
                #zeros-search-wrapper table,
                #zeros-search-wrapper .gsc-search-box,
                #zeros-search-wrapper .gsc-search-box-tools {
                    width: 100% !important;
                    table-layout: fixed !important;
                }
                /* Results wrapper - prevent fixed positioning overflow */
                .gsc-results-wrapper-nooverlay,
                .gsc-results-wrapper-overlay {
                    width: 100% !important;
                    left: 0 !important;
                    right: 0 !important;
                    position: relative !important;
                    overflow: hidden !important;
                }
                /* Prevent result thumbnails from pushing layout */
                .gsc-table-result {
                    display: block !important;
                    width: 100% !important;
                }
                .gsc-table-result tbody,
                .gsc-table-result tr {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    width: 100% !important;
                }
                .gsc-table-result td {
                    display: block !important;
                    min-width: 0 !important;
                }
                .gsc-thumbnail-inside {
                    width: auto !important;
                    flex-shrink: 0 !important;
                }
                /* Prevent long URLs from overflowing */
                .gs-visibleUrl, .gs-visibleUrl-short, .gs-visibleUrl-long,
                .gs-title, .gs-snippet {
                    word-break: break-word !important;
                    overflow-wrap: break-word !important;
                    white-space: normal !important;
                }
                /* ===== END RESPONSIVE FIX ===== */

                /* Override Google CSE styles to match dark theme */
                .gsc-control-cse {
                    background-color: transparent !important;
                    border: none !important;
                    font-family: inherit !important;
                    padding: 0 !important;
                }
                .gsc-input-box {
                    background: #000 !important;
                    border: 1px solid rgba(0, 255, 65, 0.3) !important;
                    border-radius: 8px !important;
                }
                .gsc-input {
                    background: transparent !important;
                    color: #4ade80 !important;
                    font-family: monospace !important;
                }
                .gsc-search-button-v2 {
                    background: rgba(0, 128, 0, 0.2) !important;
                    border: 1px solid rgba(0, 255, 65, 0.4) !important;
                    border-radius: 8px !important;
                    padding: 8px 16px !important;
                    cursor: pointer !important;
                }
                .gsc-search-button-v2 svg { fill: #4ade80 !important; }
                .gsc-results .gsc-result {
                    background: rgba(0,0,0,0.4) !important;
                    border: 1px solid rgba(0, 255, 65, 0.1) !important;
                    border-radius: 8px !important;
                    padding: 12px !important;
                    margin-bottom: 8px !important;
                }
                .gsc-results .gsc-result:hover { border-color: rgba(0, 255, 65, 0.3) !important; }
                .gs-title, .gs-title a, .gs-title a b {
                    color: #4ade80 !important;
                    text-decoration: none !important;
                }
                .gs-snippet { color: #9ca3af !important; }
                .gs-visibleUrl, .gs-visibleUrl-short, .gs-visibleUrl-long { color: #166534 !important; }
                .gsc-above-wrapper-area { border: none !important; }
                .gsc-result-info {
                    color: #166534 !important;
                    font-family: monospace !important;
                    font-size: 11px !important;
                }
                .gsc-orderby-container { color: #4ade80 !important; }
                .gsc-cursor-box { text-align: center !important; }
                .gsc-cursor-page {
                    color: #4ade80 !important;
                    background: rgba(0, 128, 0, 0.1) !important;
                    border: 1px solid rgba(0, 255, 65, 0.2) !important;
                    border-radius: 4px !important;
                    padding: 4px 8px !important;
                    margin: 0 2px !important;
                }
                .gsc-cursor-current-page {
                    background: rgba(0, 255, 65, 0.2) !important;
                    border-color: #4ade80 !important;
                    color: #fff !important;
                    font-weight: bold !important;
                }
                .gsc-webResult .gsc-result { padding: 10px !important; }
                .gsc-expansionArea { margin: 0 !important; }
                .gs-image-box, .gs-image {
                    border: 1px solid rgba(0, 255, 65, 0.2) !important;
                    border-radius: 4px !important;
                }
                .gsc-tabHeader {
                    color: #4ade80 !important;
                    border-color: rgba(0, 255, 65, 0.2) !important;
                }
                .gsc-tabHeader.gsc-tabhActive {
                    border-bottom-color: #4ade80 !important;
                    color: #fff !important;
                }
                .gsc-refinementsArea { background: transparent !important; }
                .gsc-option-menu-container {
                    background: #111 !important;
                    border-color: rgba(0, 255, 65, 0.2) !important;
                }
                .gsc-option-menu-item { color: #4ade80 !important; }
                .gsc-option-menu-item-highlighted { background: rgba(0, 255, 65, 0.1) !important; }
                .gsc-adBlock { display: none !important; }
                td.gsc-input { padding: 0 !important; }
                table.gsc-search-box { margin: 0 !important; }
                .gsc-modal-background-image { background: rgba(0,0,0,0.8) !important; }
                
                /* Force dark background on results overlay */
                .gsc-results-wrapper-overlay,
                .gsc-results-wrapper-visible,
                .gsc-wrapper,
                .gsc-webResult.gsc-result,
                .gsc-result-info-container,
                .gsc-results {
                    background-color: #000 !important;
                    background: #000 !important;
                }
                
                /* Ensure text is visible on dark background */
                .gs-promo {
                    color: #4ade80 !important;
                    background-color: #111 !important;
                }
                
                /* Remove white borders/backgrounds from promotion blocks if any */
                .gs-promotion-text-cell .gs-visibleUrl,
                .gs-promotion-text-cell .gs-snippet {
                    color: #4ade80 !important;
                }

                /* Mobile/Overlay specific fixes */
                .gsc-results-wrapper-overlay {
                    border: 1px solid rgba(0, 255, 65, 0.2) !important;
                    box-shadow: 0 0 20px rgba(0, 255, 65, 0.1) !important;
                }
                
                /* Close button fix */
                .gsc-results-close-btn {
                    background: transparent !important;
                    color: #4ade80 !important;
                    border: 1px solid rgba(0, 255, 65, 0.3) !important;
                    opacity: 1 !important;
                }
                .gsc-results-close-btn:hover {
                    background: rgba(0, 255, 65, 0.1) !important;
                }
                
                /* Selected result hover */
                .gsc-webResult.gsc-result:hover,
                .gsc-imageResult:hover {
                    background-color: #0a0a0a !important;
                }
            `}</style>
        </div>
    );
};

export default ZerosSearch;
