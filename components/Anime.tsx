import React, { useState, useEffect } from 'react';
import { Search, Play, ArrowLeft, Tv, AlertCircle, ChevronLeft, ChevronRight, List } from 'lucide-react';

interface AnimeItem {
    title: string;
    slug: string;
    poster: string;
    episode?: string;
    type?: string;
    url?: string;
}

interface Episode {
    title: string;
    slug: string;
    url: string;
}

interface AnimeDetail {
    title: string;
    poster: string;
    synopsis: string;
    genres: string[];
    episodes: Episode[];
}

interface StreamData {
    title: string;
    streamUrl: string;
    servers: { name: string, url: string }[];
    prevSlug: string | null;
    nextSlug: string | null;
}

const Anime: React.FC = () => {
    const [view, setView] = useState<'list' | 'detail' | 'watch'>('list');
    const [query, setQuery] = useState('');
    const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
    const [selectedAnime, setSelectedAnime] = useState<AnimeDetail | null>(null);
    const [currentStream, setCurrentStream] = useState<StreamData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    // Fetch Latest
    const fetchLatest = async (pageNum = 1) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${backendUrl}/api/anime/latest/${pageNum}`);
            if (!res.ok) throw new Error('Failed to fetch latest anime');
            const data = await res.json();
            setAnimeList(data.data);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Search
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${backendUrl}/api/anime/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            setAnimeList(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get Detail
    const handleSelectAnime = async (slug: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${backendUrl}/api/anime/detail/${slug}`);
            if (!res.ok) throw new Error('Failed to fetch details');
            const data = await res.json();
            setSelectedAnime(data);
            setView('detail');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Watch Episode
    const handleWatch = async (slug: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${backendUrl}/api/anime/watch/${slug}`);
            if (!res.ok) throw new Error('Failed to fetch stream');
            const data = await res.json();

            if (!data.streamUrl) throw new Error('No stream found');

            setCurrentStream(data);
            setView('watch');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatest();
    }, []);

    return (
        <div className="h-full bg-gray-900 text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-2 text-pink-500">
                    <Tv size={24} />
                    <h1 className="text-xl font-bold font-orbitron">ANIME STATION</h1>
                </div>

                {view === 'list' && (
                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search anime..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                        />
                        <button type="submit" className="bg-pink-600 hover:bg-pink-500 px-4 py-1 rounded text-sm font-bold transition-colors">
                            <Search size={16} />
                        </button>
                    </form>
                )}

                {view !== 'list' && (
                    <button
                        onClick={() => {
                            if (view === 'watch') setView('detail');
                            else setView('list');
                        }}
                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {error && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded border border-red-800 mb-6 flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                ) : (
                    <>
                        {/* LIST VIEW */}
                        {view === 'list' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fadeIn">
                                    {animeList.map((anime, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectAnime(anime.slug)}
                                            className="group relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden border border-gray-800 hover:border-pink-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] text-left"
                                        >
                                            <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">{anime.title}</h3>
                                                {anime.episode && <span className="text-[10px] bg-pink-600/80 text-white px-1.5 py-0.5 rounded font-bold w-fit mt-1">{anime.episode}</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {!query && (
                                    <div className="flex justify-center gap-4 mt-8">
                                        <button
                                            onClick={() => fetchLatest(page - 1)}
                                            disabled={page <= 1}
                                            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <ChevronLeft size={16} /> Prev
                                        </button>
                                        <span className="px-4 py-2 bg-black rounded border border-gray-800">Page {page}</span>
                                        <button
                                            onClick={() => fetchLatest(page + 1)}
                                            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DETAIL VIEW */}
                        {view === 'detail' && selectedAnime && (
                            <div className="max-w-5xl mx-auto animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-1">
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                                            <img src={selectedAnime.poster} alt={selectedAnime.title} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-6">
                                        <div>
                                            <h2 className="text-3xl font-bold text-pink-500 mb-2 font-orbitron">{selectedAnime.title}</h2>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {selectedAnime.genres.map((g, i) => (
                                                    <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">{g}</span>
                                                ))}
                                            </div>
                                            <p className="text-gray-300 leading-relaxed text-sm">{selectedAnime.synopsis}</p>
                                        </div>

                                        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                                            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                                                <List size={16} /> EPISODE LIST
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                                                {selectedAnime.episodes.map((ep, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleWatch(ep.slug)}
                                                        className="px-3 py-2 bg-gray-800 hover:bg-pink-600/20 hover:text-pink-400 border border-gray-700 hover:border-pink-600/50 rounded text-xs transition-colors truncate text-left"
                                                    >
                                                        {ep.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WATCH VIEW */}
                        {view === 'watch' && currentStream && (
                            <div className="max-w-6xl mx-auto animate-fadeIn space-y-4">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-pink-900 shadow-[0_0_50px_rgba(236,72,153,0.1)] relative">
                                    <iframe
                                        src={currentStream.streamUrl}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                                <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <h2 className="text-lg font-bold text-pink-400">{currentStream.title}</h2>
                                    <div className="flex gap-2">
                                        {currentStream.prevSlug && (
                                            <button
                                                onClick={() => handleWatch(currentStream.prevSlug!)}
                                                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm flex items-center gap-2 transition-colors"
                                            >
                                                <ChevronLeft size={16} /> Prev
                                            </button>
                                        )}
                                        {currentStream.nextSlug && (
                                            <button
                                                onClick={() => handleWatch(currentStream.nextSlug!)}
                                                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm flex items-center gap-2 transition-colors"
                                            >
                                                Next <ChevronRight size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {currentStream.servers.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {currentStream.servers.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentStream({ ...currentStream, streamUrl: s.url })}
                                                className={`px-3 py-1 rounded text-xs border whitespace-nowrap ${currentStream.streamUrl === s.url ? 'bg-pink-600 border-pink-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Anime;
