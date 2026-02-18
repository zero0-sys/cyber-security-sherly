import React, { useState, useEffect } from 'react';
import { Search, Play, ArrowLeft, Tv, AlertCircle, ChevronLeft, ChevronRight, Star, Calendar, Clock } from 'lucide-react';

// Jikan API Types
interface JikanImage {
    image_url: string;
    large_image_url: string;
}

interface JikanImages {
    jpg: JikanImage;
    webp: JikanImage;
}

interface JikanTrailer {
    youtube_id: string;
    url: string;
    embed_url: string;
    images: {
        image_url: string;
        small_image_url: string;
        medium_image_url: string;
        large_image_url: string;
        maximum_image_url: string;
    }
}

interface JikanAnime {
    mal_id: number;
    url: string;
    images: JikanImages;
    trailer: JikanTrailer;
    title: string;
    title_english: string;
    title_japanese: string;
    type: string;
    source: string;
    episodes: number;
    status: string;
    airing: boolean;
    duration: string;
    rating: string;
    score: number;
    scored_by: number;
    rank: number;
    popularity: number;
    members: number;
    favorites: number;
    synopsis: string;
    season: string;
    year: number;
    studios: { name: string }[];
    genres: { name: string }[];
}

const Anime: React.FC = () => {
    const [view, setView] = useState<'list' | 'detail' | 'watch'>('list');
    const [query, setQuery] = useState('');
    const [animeList, setAnimeList] = useState<JikanAnime[]>([]);
    const [selectedAnime, setSelectedAnime] = useState<JikanAnime | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Default to Top Anime for "All Anime" view
    const DEFAULT_API_URL = 'https://api.jikan.moe/v4/top/anime?filter=bypopularity&sfw';

    // Fetch Anime (Top or Search)
    const fetchAnime = async (pageNum = 1, searchQuery = '') => {
        setLoading(true);
        setError('');
        try {
            let url = '';
            if (searchQuery) {
                // Search API
                url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&sfw`;
            } else {
                // User requested specific season
                // Note: Jikan's season endpoint also supports pagination
                url = `${DEFAULT_API_URL}&page=${pageNum}`;
            }

            const res = await fetch(url);

            // Jikan Rate Limiting Handling (Simple)
            if (res.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment.');
            }

            if (!res.ok) throw new Error(`Failed to fetch anime: ${res.status}`);

            const data = await res.json();
            setAnimeList(data.data);
            setPage(data.pagination.current_page);
            setHasNextPage(data.pagination.has_next_page);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchAnime();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAnime(1, query);
    };

    const handleSelectAnime = (anime: JikanAnime) => {
        setSelectedAnime(anime);
        setView('detail');
    };

    const handleWatch = () => {
        if (selectedAnime?.trailer?.embed_url) {
            setView('watch');
        } else {
            setError('No trailer available for simulated streaming.');
        }
    };

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
                            placeholder="Data search..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-pink-500 transition-colors font-mono"
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
                            else {
                                setView('list');
                                setSelectedAnime(null);
                            }
                        }}
                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {error && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded border border-red-800 mb-6 flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto hover:text-white"><ArrowLeft size={14} className="rotate-45" /></button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                            <p className="text-pink-500 font-mono animate-pulse">CONNECTING TO JIKAN GRID...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* LIST VIEW */}
                        {view === 'list' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-fadeIn">
                                    {animeList.map((anime) => (
                                        <button
                                            key={anime.mal_id}
                                            onClick={() => handleSelectAnime(anime)}
                                            className="group relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden border border-gray-800 hover:border-pink-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] text-left"
                                        >
                                            <img
                                                src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                                                alt={anime.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">{anime.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-pink-600/80 text-white px-1.5 py-0.5 rounded font-bold">{anime.type}</span>
                                                    {anime.score && (
                                                        <span className="text-[10px] flex items-center gap-0.5 text-yellow-400">
                                                            <Star size={8} fill="currentColor" /> {anime.score}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-center gap-4 mt-8 pb-8">
                                    <button
                                        onClick={() => fetchAnime(page - 1, query)}
                                        disabled={page <= 1}
                                        className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} /> Prev
                                    </button>
                                    <span className="px-4 py-2 bg-black rounded border border-gray-800 font-mono text-pink-500">PAGE {page}</span>
                                    <button
                                        onClick={() => fetchAnime(page + 1, query)}
                                        disabled={!hasNextPage}
                                        className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2 disabled:cursor-not-allowed"
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* DETAIL VIEW */}
                        {view === 'detail' && selectedAnime && (
                            <div className="max-w-6xl mx-auto animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    {/* Cover Image & Actions */}
                                    <div className="md:col-span-4 lg:col-span-3 space-y-4">
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                                            <img
                                                src={selectedAnime.images.webp.large_image_url}
                                                alt={selectedAnime.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                {selectedAnime.trailer.embed_url ? (
                                                    <Play className="w-16 h-16 text-white opacity-80" />
                                                ) : (
                                                    <span className="text-white font-mono text-xs">NO SIGNAL</span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleWatch}
                                            disabled={!selectedAnime.trailer.embed_url}
                                            className="w-full py-3 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-bold font-orbitron tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-pink-500/25"
                                        >
                                            {selectedAnime.trailer.embed_url ? (
                                                <><Play size={18} fill="currentColor" /> WATCH TRAILER</>
                                            ) : (
                                                <><AlertCircle size={18} /> STREAM OFFLINE</>
                                            )}
                                        </button>

                                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-3 font-mono text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Format:</span>
                                                <span className="text-white">{selectedAnime.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Episodes:</span>
                                                <span className="text-white">{selectedAnime.episodes || '?'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Status:</span>
                                                <span className={`text-${selectedAnime.airing ? 'green' : 'gray'}-400`}>{selectedAnime.status}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Season:</span>
                                                <span className="text-white capitalize">{selectedAnime.season} {selectedAnime.year}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Studio:</span>
                                                <span className="text-white text-right">{selectedAnime.studios.map(s => s.name).join(', ') || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info & Synopsis */}
                                    <div className="md:col-span-8 lg:col-span-9 space-y-6">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-orbitron">{selectedAnime.title}</h2>
                                            {selectedAnime.title_english && (
                                                <h3 className="text-xl text-gray-400 mb-4">{selectedAnime.title_english}</h3>
                                            )}

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {selectedAnime.genres.map((g, i) => (
                                                    <span key={i} className="text-xs bg-pink-900/30 text-pink-300 px-3 py-1 rounded-full border border-pink-500/30">
                                                        {g.name}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-6 mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                                <div className="flex items-center gap-2">
                                                    <Star className="text-yellow-400" size={24} fill="currentColor" />
                                                    <div>
                                                        <div className="text-2xl font-bold text-white">{selectedAnime.score || 'N/A'}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">{selectedAnime.scored_by?.toLocaleString()} VOTES</div>
                                                    </div>
                                                </div>
                                                <div className="w-px h-8 bg-gray-700"></div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-2xl font-bold text-white">#{selectedAnime.rank}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">RANKED</div>
                                                </div>
                                                <div className="w-px h-8 bg-gray-700"></div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-2xl font-bold text-white">#{selectedAnime.popularity}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">POPULARITY</div>
                                                </div>
                                            </div>

                                            <div className="prose prose-invert max-w-none">
                                                <h3 className="text-lg font-bold text-pink-400 mb-2 border-b border-gray-700 pb-2">Transmission Data (Synopsis)</h3>
                                                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                                    {selectedAnime.synopsis || "No synopsis available."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WATCH VIEW (Trailer Only) */}
                        {view === 'watch' && selectedAnime && (
                            <div className="max-w-5xl mx-auto animate-fadeIn flex flex-col h-full">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-pink-900 shadow-[0_0_50px_rgba(236,72,153,0.1)] relative">
                                    <iframe
                                        src={selectedAnime.trailer.embed_url?.replace('autoplay=0', 'autoplay=1')}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        title={`${selectedAnime.title} Trailer`}
                                    />
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-pink-400">{selectedAnime.title} - Official Trailer</h2>
                                    <span className="text-xs font-mono text-gray-500">STREAMING FROM: YOUTUBE NEURAL LINK</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-400 bg-gray-800/50 p-4 rounded border border-gray-700 flex items-start gap-2">
                                    <AlertCircle className="shrink-0 text-pink-500" size={18} />
                                    <p>
                                        Notice: Full episode streaming is currently encrypted/restricted in this sector.
                                        Only the promotional data packet (Trailer) is available for decryption.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Anime;
