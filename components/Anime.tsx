import React, { useState, useEffect } from 'react';
import { Search, Play, ArrowLeft, Tv, AlertCircle, ChevronLeft, ChevronRight, Star, Calendar, Clock, List, Film, X, Info, ExternalLink } from 'lucide-react';

// Platform API Types
interface AnimeItem {
    title: string;
    slug: string;
    poster: string;
    status?: string;
    rating?: string;
    episode?: string;
    genres?: string[];
    url?: string;
    date?: string;
}

interface EpisodeItem {
    title: string;
    slug: string;
    date: string;
    url: string;
}

interface AnimeDetail extends AnimeItem {
    synopsis?: string;
    info?: Record<string, string>;
    episodes?: EpisodeItem[];
}

interface StreamData {
    title: string;
    streamUrl: string;
    slug: string;
    prevSlug?: string;
    nextSlug?: string;
}

const Anime: React.FC = () => {
    const [view, setView] = useState<'list' | 'detail' | 'watch'>('list');
    const [query, setQuery] = useState('');
    const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
    const [completedList, setCompletedList] = useState<AnimeItem[]>([]); // New state for completed
    const [selectedAnime, setSelectedAnime] = useState<AnimeDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    // Watch state
    const [playingEpisode, setPlayingEpisode] = useState<StreamData | null>(null);
    const [streamLoading, setStreamLoading] = useState(false);

    // API Base URL (Backend)
    const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/anime';

    // Fetch Latest / Ongoing
    const fetchLatest = async (pageNum = 1) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/latest/${pageNum}`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            setAnimeList(data.data || []);
            setPage(data.page || 1);
        } catch (err: any) {
            console.error("Latest fetch error:", err);
            // Don't set global error yet, try to load completed at least
        } finally {
            setLoading(false);
        }
    };

    // Fetch Completed
    const fetchCompleted = async (pageNum = 1) => {
        try {
            const res = await fetch(`${API_BASE}/completed/${pageNum}`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            setCompletedList(data.data || []);
        } catch (err: any) {
            console.error("Completed fetch error:", err);
        }
    };

    // Search
    const fetchSearch = async (q: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            setAnimeList(data.data || []);
            setCompletedList([]); // Clear completed on search
            setPage(1);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Detail
    const fetchDetail = async (slug: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/detail/${slug}`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            setSelectedAnime(data);
            setView('detail');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Stream
    const fetchStream = async (slug: string) => {
        setStreamLoading(true);
        // Don't clear playingEpisode immediately to avoid flash, or maybe do?
        setError('');
        try {
            const res = await fetch(`${API_BASE}/watch/${slug}`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            setPlayingEpisode(data);
            setView('watch');
        } catch (err: any) {
            setError(err.message);
            setPlayingEpisode(null); // Clear on error
        } finally {
            setStreamLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        const initLoad = async () => {
            setLoading(true);
            await Promise.all([fetchLatest(1), fetchCompleted(1)]);
            setLoading(false);
        };
        initLoad();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            fetchSearch(query);
        } else {
            // Reset to home
            const initLoad = async () => {
                setLoading(true);
                await Promise.all([fetchLatest(1), fetchCompleted(1)]);
                setLoading(false);
            };
            initLoad();
        }
    };

    const handleSelectAnime = (anime: AnimeItem) => {
        fetchDetail(anime.slug);
    };

    const handlePlayEpisode = (slug: string) => {
        fetchStream(slug);
    };

    return (
        <div className="h-full bg-gray-900 text-white flex flex-col font-sans">
            {/* Header ... */}
            <div className="p-3 md:p-4 border-b border-gray-800 flex items-center justify-between bg-black/50 gap-3">
                <div className="flex items-center gap-2 text-pink-500 shrink-0">
                    <Tv size={20} />
                    <h1 className="text-lg font-bold font-orbitron hidden sm:block">ANIME STATION</h1>
                </div>

                {view === 'list' && (
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search anime..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-pink-500 transition-colors font-mono"
                        />
                        <button type="submit" className="bg-pink-600 hover:bg-pink-500 px-3 py-1.5 rounded text-sm font-bold transition-colors">
                            <Search size={16} />
                        </button>
                    </form>
                )}

                {view !== 'list' && (
                    <button
                        onClick={() => {
                            if (view === 'watch') { setView('detail'); setPlayingEpisode(null); }
                            else { setView('list'); setSelectedAnime(null); }
                        }}
                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                {error && (
                    <div className="bg-red-900/30 text-red-400 p-3 rounded border border-red-800 mb-4 flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto hover:text-white"><X size={14} /></button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-14 h-14 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                            <p className="text-pink-500 font-mono animate-pulse text-sm">CONNECTING TO OTAKU GRID...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* LIST VIEW */}
                        {view === 'list' && (
                            <div className="space-y-8">
                                {/* ONGOING SECTION */}
                                {animeList.length > 0 && (
                                    <section>
                                        <h2 className="text-pink-400 font-bold font-orbitron mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                                            <Calendar size={18} /> ONGOING ANIME
                                        </h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                            {animeList.map((anime, idx) => (
                                                <button
                                                    key={`ongoing-${anime.slug}-${idx}`}
                                                    onClick={() => handleSelectAnime(anime)}
                                                    className="group relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden border border-gray-800 hover:border-pink-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] text-left"
                                                >
                                                    <img
                                                        src={anime.poster}
                                                        alt={anime.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                        <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">{anime.title}</h3>
                                                        <div className="flex flex-wrap items-center gap-1 mt-1">
                                                            {anime.episode && (
                                                                <span className="text-[9px] bg-pink-600/80 text-white px-1.5 py-0.5 rounded font-bold">{anime.episode}</span>
                                                            )}
                                                            <span className="text-[9px] text-gray-300">{anime.date}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* COMPLETED SECTION */}
                                {completedList.length > 0 && (
                                    <section>
                                        <h2 className="text-blue-400 font-bold font-orbitron mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                                            <Star size={18} /> COMPLETED ANIME
                                        </h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                            {completedList.map((anime, idx) => (
                                                <button
                                                    key={`complete-${anime.slug}-${idx}`}
                                                    onClick={() => handleSelectAnime(anime)}
                                                    className="group relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] text-left"
                                                >
                                                    <img
                                                        src={anime.poster}
                                                        alt={anime.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Image'; }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                        <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">{anime.title}</h3>
                                                        <div className="flex flex-wrap items-center gap-1 mt-1">
                                                            {anime.rating && (
                                                                <span className="text-[9px] flex items-center gap-0.5 text-yellow-400">
                                                                    <Star size={8} fill="currentColor" /> {anime.rating}
                                                                </span>
                                                            )}
                                                            <span className="text-[9px] text-gray-300">{anime.episode} Eps</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Pagination (Only shows for ongoing in default view for now, or could be improved) */}
                                {query === '' && (
                                    <div className="flex justify-center gap-3 mt-6 pb-6">
                                        <button
                                            onClick={() => fetchLatest(page - 1)}
                                            disabled={page <= 1}
                                            className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1 disabled:cursor-not-allowed text-sm"
                                        >
                                            <ChevronLeft size={14} /> Prev
                                        </button>
                                        <span className="px-3 py-2 bg-black rounded border border-gray-800 font-mono text-pink-500 text-sm">PAGE {page}</span>
                                        <button
                                            onClick={() => fetchLatest(page + 1)}
                                            className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1 disabled:cursor-not-allowed text-sm"
                                        >
                                            Next <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DETAIL VIEW */}
                        {view === 'detail' && selectedAnime && (
                            <div className="max-w-6xl mx-auto">
                                {/* Top Section: Cover + Basic Info */}
                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    {/* Cover */}
                                    <div className="w-full md:w-48 lg:w-56 shrink-0 space-y-3">
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                                            <img
                                                src={selectedAnime.poster}
                                                alt={selectedAnime.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Status / Info Badge */}
                                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-2 font-mono text-xs">
                                            {selectedAnime.info && Object.entries(selectedAnime.info).slice(0, 5).map(([key, val]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="text-white text-right truncate ml-2 max-w-[120px]">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Info */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-white font-orbitron">{selectedAnime.title}</h2>
                                        </div>

                                        <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm bg-gray-800/20 p-4 rounded-lg border border-gray-700/50">
                                            {selectedAnime.synopsis || "No synopsis available."}
                                        </p>

                                        {/* Episodes List */}
                                        <div>
                                            <h3 className="text-lg font-bold text-pink-400 mb-2 flex items-center gap-2">
                                                <List size={18} /> EPISODES
                                            </h3>
                                            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {selectedAnime.episodes?.map((ep, idx) => (
                                                    <button
                                                        key={`${ep.slug}-${idx}`}
                                                        onClick={() => handlePlayEpisode(ep.slug)}
                                                        className="w-full flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-pink-500/50 hover:bg-pink-900/10 transition-all group text-left"
                                                    >
                                                        <div className="w-8 h-8 bg-pink-900/30 rounded flex items-center justify-center shrink-0 border border-pink-500/20 group-hover:bg-pink-600/30 transition-colors">
                                                            <Play size={12} className="text-pink-400 ml-0.5" fill="currentColor" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">{ep.title}</h4>
                                                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">{ep.date}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WATCH VIEW */}
                        {view === 'watch' && (
                            <div className="max-w-5xl mx-auto flex flex-col h-full">
                                {streamLoading ? (
                                    <div className="aspect-video bg-black rounded-xl border border-pink-900 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                                            <p className="text-pink-500 font-mono text-sm animate-pulse">LOADING STREAM...</p>
                                        </div>
                                    </div>
                                ) : playingEpisode ? (
                                    <>
                                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-pink-900 shadow-[0_0_50px_rgba(236,72,153,0.1)] relative group">
                                            {playingEpisode.streamUrl ? (
                                                <>
                                                    <iframe
                                                        src={playingEpisode.streamUrl}
                                                        className="w-full h-full border-0"
                                                        allowFullScreen
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        title={playingEpisode.title}
                                                        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
                                                    />
                                                    {/* Hover Overlay for External Link */}
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a
                                                            href={playingEpisode.streamUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-black/80 hover:bg-pink-600 text-white text-xs px-3 py-1.5 rounded flex items-center gap-2 border border-pink-500/30 backdrop-blur-sm transition-colors"
                                                        >
                                                            <ExternalLink size={12} /> Open in New Tab
                                                        </a>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-red-400 flex-col gap-2">
                                                    <AlertCircle size={32} />
                                                    <p>Stream not available for this episode.</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h2 className="text-lg font-bold text-pink-400">{playingEpisode.title}</h2>
                                                <p className="text-[10px] font-mono text-gray-600">SOURCE: OTAKUDESU — If video doesn't load, check your internet connection.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => playingEpisode.prevSlug && handlePlayEpisode(playingEpisode.prevSlug)}
                                                    disabled={!playingEpisode.prevSlug}
                                                    className="px-3 py-1.5 bg-gray-800 rounded text-xs font-bold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    PREV
                                                </button>
                                                <button
                                                    onClick={() => playingEpisode.nextSlug && handlePlayEpisode(playingEpisode.nextSlug)}
                                                    disabled={!playingEpisode.nextSlug}
                                                    className="px-3 py-1.5 bg-gray-800 rounded text-xs font-bold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    NEXT
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-10 text-red-500">Failed to load episode data.</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(236,72,153,0.3); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(236,72,153,0.5); }
            `}</style>
        </div>
    );
};

export default Anime;
