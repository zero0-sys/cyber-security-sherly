import React, { useState } from 'react';
import { Search, Globe, Shield, ExternalLink, Loader, Image, FileText, AlertCircle } from 'lucide-react';

interface SearchResult {
    title: string;
    link: string;
    displayLink: string;
    snippet: string;
    pagemap?: {
        cse_thumbnail?: { src: string; width: string; height: string }[];
        cse_image?: { src: string }[];
    };
}

const ZerosSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState('0');
    const [mode, setMode] = useState<'web' | 'image'>('web');

    const CX = '676e2e12839934c63';
    const API_KEY = 'AIzaSyA6xsXNKSoyuIl0iGM4S4JJtFCbaMxNn44';

    const handleSearch = async (e?: React.FormEvent, pageNum = 1, searchMode?: 'web' | 'image') => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        const currentMode = searchMode ?? mode;
        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const start = (pageNum - 1) * 10 + 1;
            let url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}&start=${start}`;
            if (currentMode === 'image') {
                url += '&searchType=image';
            }

            const res = await fetch(url);
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error?.message || `API Error: ${res.status}`);
            }

            const data = await res.json();
            setResults(data.items || []);
            setTotalResults(data.searchInformation?.formattedTotalResults || '0');
            setPage(pageNum);
        } catch (err: any) {
            setError(err.message || 'Search failed');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: 'web' | 'image') => {
        setMode(newMode);
        if (query.trim()) {
            handleSearch(undefined, 1, newMode);
        }
    };

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

            {/* Search Bar & Tabs */}
            <div className="p-4 relative z-10 border-b border-green-900/50 bg-black/50">
                <form onSubmit={(e) => handleSearch(e, 1)} className="flex gap-2 max-w-3xl mx-auto">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter search query..."
                            className="w-full bg-black border border-green-500/40 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 transition-all font-mono text-green-300 placeholder-green-800 shadow-[0_0_10px_rgba(0,255,65,0.05)]"
                        />
                        <Search className="absolute left-3 top-3 w-4 h-4 text-green-700 group-focus-within:text-green-400 transition-colors" />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-900/30 border border-green-500/50 text-green-400 px-5 py-2.5 rounded-lg hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(0,255,65,0.2)] transition-all font-bold text-sm tracking-wide font-mono"
                    >
                        SEARCH
                    </button>
                </form>

                {/* Mode Tabs */}
                <div className="flex gap-4 max-w-3xl mx-auto mt-3">
                    <button
                        onClick={() => switchMode('web')}
                        className={`flex items-center gap-1.5 text-xs font-mono pb-1 border-b-2 transition-all ${mode === 'web' ? 'border-green-400 text-green-400' : 'border-transparent text-green-700 hover:text-green-500'
                            }`}
                    >
                        <FileText size={12} /> WEB
                    </button>
                    <button
                        onClick={() => switchMode('image')}
                        className={`flex items-center gap-1.5 text-xs font-mono pb-1 border-b-2 transition-all ${mode === 'image' ? 'border-green-400 text-green-400' : 'border-transparent text-green-700 hover:text-green-500'
                            }`}
                    >
                        <Image size={12} /> IMAGE
                    </button>
                    {searched && !loading && (
                        <span className="ml-auto text-[10px] text-green-700 font-mono self-end">
                            {totalResults} RESULTS FOUND
                        </span>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 relative z-10 custom-scrollbar-green">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <Loader className="w-10 h-10 text-green-500 animate-spin" />
                        <p className="text-green-500 font-mono text-sm animate-pulse">QUERYING SECURE NODES...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-red-400">
                        <AlertCircle size={32} />
                        <p className="font-mono text-sm text-center max-w-md">{error}</p>
                    </div>
                )}

                {!loading && !error && searched && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-green-700">
                        <Search size={32} />
                        <p className="font-mono text-sm">NO DATA FOUND IN THIS SECTOR</p>
                    </div>
                )}

                {!loading && !error && !searched && (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-green-800 opacity-50">
                        <Shield size={48} className="stroke-1" />
                        <p className="font-mono text-xs tracking-widest">ENCRYPTED UPLINK ESTABLISHED</p>
                    </div>
                )}

                {/* Web Results */}
                {!loading && mode === 'web' && results.length > 0 && (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {results.map((item, idx) => {
                            const thumb = item.pagemap?.cse_thumbnail?.[0]?.src;
                            return (
                                <a
                                    key={idx}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 rounded-lg border border-green-900/40 bg-black/60 hover:border-green-500/50 hover:bg-green-900/10 transition-all group"
                                >
                                    <div className="flex gap-4">
                                        {thumb && (
                                            <div className="w-20 h-20 shrink-0 rounded overflow-hidden bg-gray-900 hidden sm:block">
                                                <img src={thumb} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] text-green-600 font-mono truncate mb-1">{item.displayLink}</p>
                                            <h3 className="text-sm font-bold text-green-300 group-hover:text-green-400 transition-colors mb-1 line-clamp-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.snippet}</p>
                                        </div>
                                        <ExternalLink size={14} className="text-green-800 group-hover:text-green-500 shrink-0 mt-1 transition-colors" />
                                    </div>
                                </a>
                            );
                        })}

                        {/* Pagination */}
                        <div className="flex justify-center gap-3 pt-4 pb-8">
                            <button
                                onClick={() => handleSearch(undefined, page - 1)}
                                disabled={page <= 1}
                                className="px-4 py-2 bg-black border border-green-900 rounded text-xs font-mono text-green-500 hover:border-green-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                ← PREV
                            </button>
                            <span className="px-4 py-2 bg-green-900/20 border border-green-500/30 rounded text-xs font-mono text-green-400">
                                PAGE {page}
                            </span>
                            <button
                                onClick={() => handleSearch(undefined, page + 1)}
                                disabled={results.length < 10}
                                className="px-4 py-2 bg-black border border-green-900 rounded text-xs font-mono text-green-500 hover:border-green-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                NEXT →
                            </button>
                        </div>
                    </div>
                )}

                {/* Image Results */}
                {!loading && mode === 'image' && results.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {results.map((item, idx) => {
                                const imgSrc = item.link;
                                return (
                                    <a
                                        key={idx}
                                        href={imgSrc}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-square bg-gray-900 rounded-lg overflow-hidden border border-green-900/30 hover:border-green-500/50 transition-all"
                                    >
                                        <img src={imgSrc} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[10px] text-green-300 font-mono truncate">{item.title}</p>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center gap-3 pt-6 pb-8">
                            <button
                                onClick={() => handleSearch(undefined, page - 1)}
                                disabled={page <= 1}
                                className="px-4 py-2 bg-black border border-green-900 rounded text-xs font-mono text-green-500 hover:border-green-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                ← PREV
                            </button>
                            <span className="px-4 py-2 bg-green-900/20 border border-green-500/30 rounded text-xs font-mono text-green-400">
                                PAGE {page}
                            </span>
                            <button
                                onClick={() => handleSearch(undefined, page + 1)}
                                disabled={results.length < 10}
                                className="px-4 py-2 bg-black border border-green-900 rounded text-xs font-mono text-green-500 hover:border-green-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                NEXT →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar-green::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-green::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
                .custom-scrollbar-green::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.2); border-radius: 3px; }
                .custom-scrollbar-green::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 65, 0.4); }
                .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default ZerosSearch;
