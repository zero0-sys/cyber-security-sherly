import React, { useState, useEffect } from 'react';
import { Newspaper, Globe, ArrowRight, Clock, ShieldAlert, Tag, ExternalLink, RefreshCw } from 'lucide-react';

interface NewsArticle {
    article_id: string;
    title: string;
    link: string;
    description: string;
    pubDate: string;
    image_url?: string;
    source_id: string;
    category: string[];
}

const CyberNews: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_KEY = 'pub_2e90a14d214d4bf0b624a92ed25985f0'; // User provided API Key

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            // "Show All" / Broad fetch strategy
            // Using 'technology' and 'science' categories to keep it relevant to "Cyber Security Sherly" context
            // while obeying "tampilkan semua" (show all/latest).
            // Removed 'q' parameter to fix 422 error and avoid search mode.
            const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=technology,science&language=en,id`;

            const response = await fetch(url);
            if (!response.ok) {
                // If 422 persists, try an even simpler call
                if (response.status === 422) {
                    throw new Error('API Configuration Error (422). Retrying with simpler request...');
                }
                throw new Error(`API Error: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                // Sort by pubDate descending (Newest first) just in case
                const sorted = (data.results || []).sort((a: NewsArticle, b: NewsArticle) => {
                    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
                });
                setArticles(sorted);
            } else {
                throw new Error(data.message || 'Failed to fetch news');
            }
        } catch (err: any) {
            console.error(err);
            // Fallback to purely English if mixed fails, or just generic error
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div className="h-full flex flex-col bg-black text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-cyan-900/30 bg-[#0a0a0a] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-900/20 rounded-xl flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <Newspaper className="text-cyan-400 w-6 h-6 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wide">
                            CYBER NEWSFEED
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            LIVE STREAM ACTIVE — GLOBAL INTEL
                        </div>
                    </div>
                </div>

                <button
                    onClick={fetchNews}
                    className="p-2 bg-gray-900 rounded-lg border border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-900/20 text-gray-400 hover:text-cyan-400 transition-all"
                    title="Refresh Feed"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Content Area - List View */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/50 via-black to-black custom-scrollbar">

                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-cyan-900/30 rounded-full"></div>
                            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                        </div>
                        <p className="text-cyan-500 font-mono animate-pulse text-sm tracking-widest">ESTABLISHING SECURE UPLINK...</p>
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-400 gap-4">
                        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/30">
                            <ShieldAlert className="w-10 h-10 opacity-80" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold font-orbitron mb-1">CONNECTION INTERRUPTED</h3>
                            <p className="font-mono text-sm opacity-60 max-w-md mx-auto">{error}</p>
                        </div>
                        <button
                            onClick={fetchNews}
                            className="mt-4 px-6 py-2 bg-red-900/30 border border-red-500/50 rounded hover:bg-red-500/20 text-red-200 transition-colors font-mono text-sm"
                        >
                            RECONNECT
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
                        {articles.map((article, idx) => (
                            <div
                                key={`${article.article_id}-${idx}`}
                                className="group relative bg-gray-900/40 border border-gray-800 hover:border-cyan-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-900/60 backdrop-blur-sm flex flex-col sm:flex-row gap-4 sm:gap-6 p-4"
                            >
                                {/* Left: Image (Thumbnail style) */}
                                <div className="w-full sm:w-48 h-32 sm:h-auto shrink-0 rounded-lg overflow-hidden bg-gray-950 border border-gray-800 relative">
                                    {article.image_url ? (
                                        <img
                                            src={article.image_url}
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <Globe className="w-10 h-10 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                                </div>

                                {/* Right: Content */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 font-mono mb-2">
                                        <span className="text-cyan-500/80 font-bold px-1.5 py-0.5 bg-cyan-950/50 rounded border border-cyan-900/50 uppercase tracking-wider">
                                            {article.source_id || 'UNKNOWN'}
                                        </span>
                                        <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {article.pubDate ? new Date(article.pubDate).toLocaleString() : 'Just now'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg md:text-xl font-bold text-gray-100 mb-2 leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>

                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                                        {article.description || 'Global transmission intercepted. Decrypting content...'}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-800/50">
                                        <div className="flex gap-2">
                                            {article.category?.slice(0, 3).map((cat, i) => (
                                                <span key={i} className="text-[10px] text-gray-500 uppercase bg-gray-800/50 px-2 py-0.5 rounded">
                                                    #{cat}
                                                </span>
                                            ))}
                                        </div>

                                        <a
                                            href={article.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs font-bold text-cyan-500 hover:text-cyan-300 transition-colors group/link"
                                        >
                                            FULL REPORT
                                            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(6, 182, 212, 0.2);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(6, 182, 212, 0.4);
                }
            `}</style>
        </div>
    );
};

export default CyberNews;
