import React, { useState, useEffect } from 'react';
import { Newspaper, Globe, Search, ArrowRight, Clock, ShieldAlert, Tag, ExternalLink } from 'lucide-react';

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
    const [query, setQuery] = useState('cyber security');
    const [category, setCategory] = useState<string>('technology');

    const API_KEY = 'pub_2e90a14d214d4bf0b624a92ed25985f0'; // User provided API Key

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            // Using AllNews endpoint to get broader results, filtering by category and query
            const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(query)}&category=${category}&language=en`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                setArticles(data.results);
            } else {
                throw new Error(data.message || 'Failed to fetch news');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []); // Initial fetch

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchNews();
    };

    return (
        <div className="h-full flex flex-col bg-black text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/30 bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-900/20 rounded-lg flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <Newspaper className="text-cyan-400 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            CYBER NEWSFEED
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            LIVE STREAM ACTIVE
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
                    <div className="relative group flex-1 md:w-80">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search (e.g. ransomware, ai)..."
                            className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-cyan-100 placeholder-gray-600"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <button
                        type="submit"
                        className="bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 transition-all font-bold text-sm tracking-wide"
                    >
                        SCAN
                    </button>
                </form>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black custom-scrollbar">

                {loading && (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                        <p className="text-cyan-500 font-mono animate-pulse">ESTABLISHING UPLINK...</p>
                    </div>
                )}

                {error && (
                    <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2">
                        <ShieldAlert className="w-12 h-12 mb-2 opacity-80" />
                        <h3 className="text-xl font-bold font-orbitron">CONNECTION FAILED</h3>
                        <p className="font-mono text-sm opacity-70">{error}</p>
                        <button
                            onClick={fetchNews}
                            className="mt-4 px-6 py-2 bg-red-900/20 border border-red-500/50 rounded hover:bg-red-500/10 transition-colors"
                        >
                            RETRY CONNECTION
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <div
                                key={article.article_id}
                                className="group bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col h-full backdrop-blur-sm"
                            >
                                {/* Image Container */}
                                <div className="h-48 overflow-hidden relative bg-gray-900">
                                    {article.image_url ? (
                                        <img
                                            src={article.image_url}
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                            <Globe className="w-12 h-12 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-cyan-900/80 text-cyan-300 text-[10px] font-bold rounded uppercase backdrop-blur-md border border-cyan-500/30">
                                            {article.source_id}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-3 font-mono">
                                        <Clock className="w-3 h-3" />
                                        <span>{article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'Recent'}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>

                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                                        {article.description || 'No description available for this encrypted transmission...'}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
                                        <div className="flex gap-2 overflow-hidden">
                                            {article.category?.slice(0, 2).map((cat, idx) => (
                                                <span key={idx} className="flex items-center gap-1 text-[10px] text-gray-500 uppercase">
                                                    <Tag className="w-3 h-3" /> {cat}
                                                </span>
                                            ))}
                                        </div>
                                        <a
                                            href={article.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-cyan-500 text-xs font-bold hover:text-cyan-300 transition-colors group-hover:translate-x-1 duration-300"
                                        >
                                            READ_FULL
                                            <ExternalLink className="w-3 h-3" />
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
                    background: rgba(6, 182, 212, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(6, 182, 212, 0.6);
                }
            `}</style>
        </div>
    );
};

export default CyberNews;
